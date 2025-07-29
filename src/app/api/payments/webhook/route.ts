// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { payMobService } from '@/lib/paymob';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

// POST /api/payments/webhook - Handle PayMob webhook notifications
export async function POST(request: NextRequest) {
  let webhookData: any;
  let transactionId: number | null = null;

  try {
    // Parse webhook data
    webhookData = await request.json();
    transactionId = webhookData.id;
    
    console.log('PayMob webhook received:', {
      transactionId: webhookData.id,
      orderId: webhookData.order?.id,
      success: webhookData.success,
      amount: webhookData.amount_cents,
      timestamp: new Date().toISOString()
    });

    // Validate webhook payload structure
    if (!payMobService.validateWebhookPayload(webhookData)) {
      console.error('Invalid webhook payload structure:', webhookData);
      return createErrorResponse(
        'INVALID_PAYLOAD',
        'Invalid webhook payload structure',
        400
      );
    }

    // Verify webhook signature
    if (!payMobService.verifyWebhookSignature(webhookData)) {
      console.error('Invalid PayMob webhook signature for transaction:', transactionId);
      return createErrorResponse(
        'INVALID_SIGNATURE',
        'Invalid webhook signature',
        401
      );
    }

    // Process webhook data
    const processedData = payMobService.processWebhook(webhookData);

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymobOrderId: processedData.orderId.toString() },
          { paymobOrderId: processedData.merchantOrderId }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            professorId: true
          }
        }
      }
    });

    if (!payment) {
      console.error('Payment not found for webhook:', {
        orderId: processedData.orderId,
        merchantOrderId: processedData.merchantOrderId,
        transactionId: processedData.transactionId
      });
      
      // Store webhook for manual review
      await prisma.paymentWebhook.create({
        data: {
          id: `webhook_${processedData.transactionId}_${Date.now()}`,
          paymentId: 'unknown', // Will need manual linking
          paymobTransactionId: BigInt(processedData.transactionId),
          webhookPayload: webhookData,
          lastError: 'Payment record not found',
          processingAttempts: 1
        }
      }).catch(err => {
        console.error('Failed to store orphaned webhook:', err);
      });

      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'Payment record not found',
        404
      );
    }

    // Check for duplicate webhook processing (idempotency)
    const existingWebhook = await prisma.paymentWebhook.findFirst({
      where: {
        paymentId: payment.id,
        paymobTransactionId: BigInt(processedData.transactionId)
      }
    });

    if (existingWebhook && existingWebhook.processedAt) {
      console.log('Webhook already processed:', {
        paymentId: payment.id,
        transactionId: processedData.transactionId,
        processedAt: existingWebhook.processedAt
      });
      return createSuccessResponse({
        message: 'Webhook already processed',
        paymentId: payment.id,
        status: payment.status,
        processedAt: existingWebhook.processedAt
      });
    }

    // Determine new payment status
    const newStatus = processedData.success ? 'COMPLETED' : 'FAILED';
    const completedAt = processedData.success ? new Date() : null;
    const failureReason = !processedData.success ? 'Payment failed at PayMob gateway' : null;
    
    await prisma.$transaction(async (tx) => {
      // Create or update webhook record
      const webhookId = existingWebhook?.id || `webhook_${processedData.transactionId}_${Date.now()}`;
      
      if (existingWebhook) {
        await tx.paymentWebhook.update({
          where: { id: existingWebhook.id },
          data: {
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: existingWebhook.processingAttempts + 1,
            lastError: null
          }
        });
      } else {
        await tx.paymentWebhook.create({
          data: {
            id: webhookId,
            paymentId: payment.id,
            paymobTransactionId: BigInt(processedData.transactionId),
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: 1
          }
        });
      }

      // Update payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTransactionId: BigInt(processedData.transactionId),
          completedAt,
          failureReason,
          paymobResponse: {
            ...payment.paymobResponse as any,
            webhook: {
              transactionId: processedData.transactionId,
              success: processedData.success,
              amountCents: processedData.amountCents,
              currency: processedData.currency,
              processedAt: new Date().toISOString(),
              rawData: webhookData
            }
          }
        }
      });

      // Note: Enrollment creation will be handled outside the transaction
      // to avoid transaction timeout issues
    });

    // Handle enrollment creation for successful payments
    let enrollmentResult = null;
    if (processedData.success) {
      try {
        const { EnrollmentService } = await import('@/lib/services/enrollment-service');
        enrollmentResult = await EnrollmentService.createEnrollmentFromPayment(payment.id);
        
        if (!enrollmentResult.success) {
          console.error('Enrollment creation failed:', enrollmentResult);
          await EnrollmentService.handleEnrollmentFailure(payment.id, enrollmentResult.error || 'Unknown error');
        } else {
          console.log('Enrollment created successfully:', {
            paymentId: payment.id,
            enrollmentId: enrollmentResult.enrollmentId,
            userId: payment.userId,
            courseId: payment.courseId
          });
        }
      } catch (enrollmentError) {
        console.error('Enrollment service error:', enrollmentError);
        const { EnrollmentService } = await import('@/lib/services/enrollment-service');
        await EnrollmentService.handleEnrollmentFailure(
          payment.id, 
          enrollmentError instanceof Error ? enrollmentError.message : 'Enrollment service error'
        );
      }
    }

    // Log the result
    console.log('Payment webhook processed:', {
      paymentId: payment.id,
      status: newStatus,
      transactionId: processedData.transactionId,
      success: processedData.success,
      enrollmentCreated: enrollmentResult?.success || false,
      enrollmentId: enrollmentResult?.enrollmentId
    });

    return createSuccessResponse({
      message: 'Webhook processed successfully',
      paymentId: payment.id,
      status: newStatus,
      transactionId: processedData.transactionId,
      enrollmentCreated: enrollmentResult?.success || false,
      enrollmentId: enrollmentResult?.enrollmentId
    });

  } catch (error) {
    console.error('PayMob webhook processing error:', error);
    
    // Try to store failed webhook for retry
    if (transactionId && webhookData) {
      try {
        await prisma.paymentWebhook.upsert({
          where: {
            id: `webhook_${transactionId}_error_${Date.now()}`
          },
          create: {
            id: `webhook_${transactionId}_error_${Date.now()}`,
            paymentId: 'error', // Will need manual linking
            paymobTransactionId: BigInt(transactionId),
            webhookPayload: webhookData,
            lastError: error instanceof Error ? error.message : 'Unknown error',
            processingAttempts: 1
          },
          update: {
            processingAttempts: { increment: 1 },
            lastError: error instanceof Error ? error.message : 'Unknown error',
            webhookPayload: webhookData
          }
        });
      } catch (dbError) {
        console.error('Failed to store error webhook:', dbError);
      }
    }
    
    // Return success to PayMob to avoid retries for our internal errors
    // But log the error for investigation
    return createSuccessResponse({
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      transactionId
    });
  }
}

// GET /api/payments/webhook - Health check for webhook endpoint
export async function GET() {
  return createSuccessResponse({
    message: 'PayMob webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}