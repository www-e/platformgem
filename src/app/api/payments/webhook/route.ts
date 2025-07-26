// src/app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { payMobService } from '@/lib/paymob';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

// POST /api/payments/webhook - Handle PayMob webhook notifications
export async function POST(request: NextRequest) {
  try {
    // Parse webhook data
    const webhookData = await request.json();
    
    console.log('PayMob webhook received:', {
      transactionId: webhookData.id,
      orderId: webhookData.order?.id,
      success: webhookData.success,
      amount: webhookData.amount_cents
    });

    // Process and verify webhook
    const processedData = payMobService.processWebhook(webhookData);

    if (!processedData.isValid) {
      console.error('Invalid PayMob webhook signature');
      return createErrorResponse(
        'INVALID_SIGNATURE',
        'Invalid webhook signature',
        400
      );
    }

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
        merchantOrderId: processedData.merchantOrderId
      });
      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'Payment record not found',
        404
      );
    }

    // Check if payment is already processed
    if (payment.status !== 'PENDING') {
      console.log('Payment already processed:', payment.id, payment.status);
      return createSuccessResponse({
        message: 'Payment already processed',
        paymentId: payment.id,
        status: payment.status
      });
    }

    // Update payment status based on webhook data
    const newStatus = processedData.success ? 'COMPLETED' : 'FAILED';
    
    await prisma.$transaction(async (tx) => {
      // Update payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTxnId: processedData.transactionId.toString(),
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

      // If payment successful, create enrollment
      if (processedData.success) {
        // Check if enrollment already exists (safety check)
        const existingEnrollment = await tx.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: payment.userId,
              courseId: payment.courseId
            }
          }
        });

        if (!existingEnrollment) {
          await tx.enrollment.create({
            data: {
              userId: payment.userId,
              courseId: payment.courseId,
              progressPercent: 0,
              completedLessonIds: [],
              totalWatchTime: 0
            }
          });

          console.log('Enrollment created for successful payment:', {
            paymentId: payment.id,
            userId: payment.userId,
            courseId: payment.courseId
          });
        }
      }
    });

    // Log the result
    console.log('Payment webhook processed:', {
      paymentId: payment.id,
      status: newStatus,
      transactionId: processedData.transactionId,
      success: processedData.success,
      enrollmentCreated: processedData.success
    });

    return createSuccessResponse({
      message: 'Webhook processed successfully',
      paymentId: payment.id,
      status: newStatus,
      transactionId: processedData.transactionId
    });

  } catch (error) {
    console.error('PayMob webhook processing error:', error);
    
    // Return success to PayMob to avoid retries for our internal errors
    // But log the error for investigation
    return createSuccessResponse({
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
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