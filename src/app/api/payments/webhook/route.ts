// src/app/api/payments/webhook/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { payMobService } from "@/lib/paymob/client";
import { 
  createSuccessResponse,
  createErrorResponse,
  API_ERROR_CODES 
} from "@/lib/api-response";
import { Payment } from '@/lib/types/db';
import type { PaymentWebhook } from '@prisma/client';
import type { InputJsonValue } from '@prisma/client/runtime/library';
import { PayMobTransactionResponse } from "@/lib/paymob/types";


// R.A.K.A.N'S NOTE: Define the shape of the processed data from our webhook service.
interface ProcessedWebhookData {
  isSuccess: boolean;
  transactionId: number;
  orderId?: number;
  merchantOrderId?: string;
  amountCents?: number;
  currency?: string;
  isValid: boolean;
}

// R.A.K.A.N'S NOTE: Define a more specific type for the webhook payload.
interface WebhookPayload {
  [key: string]: unknown;
  obj: {
    id: number;
    order?: {
      id: number;
    };
    success?: boolean;
    amount_cents?: number;
    [key: string]: unknown;
  };
}

// POST /api/payments/webhook - Handle PayMob webhook notifications
export async function POST(request: NextRequest) {
  let webhookData: WebhookPayload | null = null;
  let transactionId: number | null = null;

  try {
    // Parse webhook data
    webhookData = await request.json();
    
    // Fixed: Add explicit null check before accessing webhookData
    if (!webhookData) {
      return createErrorResponse(
        "WEBHOOK_DATA_MISSING",
        "Webhook data is missing or invalid",
        400
      );
    }
    
    transactionId = webhookData.obj?.id ?? null;

    console.log("PayMob webhook received:", {
      transactionId: transactionId,
      orderId: webhookData.obj?.order?.id,
      success: webhookData.obj?.success,
      amount: webhookData.obj?.amount_cents,
      timestamp: new Date().toISOString(),
    });

    // R.A.K.A.N'S NOTE: We process the 'obj' part of the payload
    const webhookObject = webhookData.obj;

    // Validate webhook payload structure
    if (!payMobService.validateWebhookPayload(webhookObject)) {
      console.error("Invalid webhook payload structure:", webhookObject);
      return createErrorResponse(
        API_ERROR_CODES.WEBHOOK_PAYLOAD_INVALID,
        "Invalid webhook payload structure",
        400,
        { receivedPayload: webhookObject }
      );
    }

    // Verify webhook signature
    const isValidSignature = await payMobService.verifyWebhookSignature(webhookObject as PayMobTransactionResponse);
    if (!isValidSignature) {
      console.error(
        "Invalid PayMob webhook signature for transaction:",
        transactionId
      );
      return createErrorResponse(
        API_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
        "Invalid webhook signature",
        401,
        { transactionId: transactionId }
      );
    }

    // Process webhook data
    const rawProcessedData = await payMobService.processWebhook(webhookObject);
    
    // Validate and type the processed data
    const processedData: ProcessedWebhookData = {
      isSuccess: Boolean(rawProcessedData.isSuccess),
      transactionId: rawProcessedData.transactionId || 0,
      orderId: rawProcessedData.orderId,
      merchantOrderId: rawProcessedData.merchantOrderId,
      amountCents: rawProcessedData.amountCents,
      currency: rawProcessedData.currency,
      isValid: Boolean(rawProcessedData.isValid),
    };

    // Validate processed data
    if (!processedData.isValid) {
      console.error("Invalid webhook data processing");
      return createErrorResponse(
        "WEBHOOK_INVALID",
        "Invalid webhook data",
        400
      );
    }

    // R.A.K.A.N'S NOTE: Ensure transactionId is valid before proceeding
    if (!processedData.transactionId) {
      console.error("Missing transaction ID in webhook data");
      return createErrorResponse(
        "WEBHOOK_MISSING_DATA",
        "Missing transaction ID",
        400
      );
    }

    const validatedTransactionId: number = processedData.transactionId;

    // Build search conditions
    const searchConditions = [];
    if (processedData.orderId) {
      searchConditions.push({
        paymobOrderId: processedData.orderId.toString(),
      });
    }
    if (processedData.merchantOrderId) {
      searchConditions.push({ paymobOrderId: processedData.merchantOrderId });
    }

    if (searchConditions.length === 0) {
      console.error("No order ID or merchant order ID in webhook data");
      return createErrorResponse(
        "WEBHOOK_MISSING_ORDER_ID",
        "Missing order identification",
        400
      );
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: { OR: searchConditions },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true, professorId: true } },
      },
    });

    if (!payment) {
      console.error("Payment not found for webhook:", {
        orderId: processedData.orderId,
        merchantOrderId: processedData.merchantOrderId,
        transactionId: validatedTransactionId,
      });

      // Store webhook for manual review
      await prisma.paymentWebhook
        .create({
          data: {
            id: `webhook_${validatedTransactionId}_${Date.now()}`,
            paymentId: "unknown", // Will need manual linking
            paymobTransactionId: BigInt(validatedTransactionId),
            webhookPayload: webhookData as InputJsonValue,
            lastError: "Payment record not found",
            processingAttempts: 1,
          },
        })
        .catch((err: unknown) => {
          console.error("Failed to store orphaned webhook:", err);
        });

      return createErrorResponse(
        "PAYMENT_NOT_FOUND",
        "Payment record not found",
        404
      );
    }

    // Check for duplicate webhook processing (idempotency)
    const existingWebhook: PaymentWebhook | null = await prisma.paymentWebhook.findFirst({
      where: {
        paymentId: payment.id,
        paymobTransactionId: BigInt(validatedTransactionId),
      },
    });

    // Enhanced idempotency check
    if (existingWebhook && existingWebhook.processedAt) {
      // Check if payment status matches webhook result
      const expectedStatus = processedData.isSuccess ? "COMPLETED" : "FAILED";

      if (payment.status === expectedStatus) {
        console.log("Webhook already processed successfully:", {
          paymentId: payment.id,
          transactionId: validatedTransactionId,
          processedAt: existingWebhook.processedAt,
          status: payment.status,
        });

        return createSuccessResponse({
          message: "Webhook already processed",
          paymentId: payment.id,
          status: payment.status,
          transactionId: validatedTransactionId,
          processedAt: existingWebhook.processedAt,
          alreadyProcessed: true,
        });
      } else {
        // Status mismatch - this could indicate a problem
        console.warn("Webhook processed but payment status mismatch:", {
          paymentId: payment.id,
          transactionId: validatedTransactionId,
          expectedStatus,
          currentStatus: payment.status,
          webhookProcessedAt: existingWebhook.processedAt,
        });

        // Mark for manual review but don't reprocess
        await prisma.paymentWebhook.update({
          where: { id: existingWebhook.id },
          data: {
            lastError: `Status mismatch: expected ${expectedStatus}, found ${payment.status}`,
            processingAttempts: existingWebhook.processingAttempts + 1,
          },
        });

        return createSuccessResponse({
          message: "Webhook already processed but status mismatch detected",
          paymentId: payment.id,
          status: payment.status,
          requiresManualReview: true,
          processedAt: existingWebhook.processedAt,
        });
      }
    }

    // Check for potential duplicate transactions with different order IDs
    const duplicateTransaction: PaymentWebhook | null = await prisma.paymentWebhook.findFirst({
      where: {
        paymobTransactionId: BigInt(validatedTransactionId),
        paymentId: { not: payment.id },
        processedAt: { not: null },
      },
    });

    if (duplicateTransaction) {
      console.warn("Duplicate transaction ID detected:", {
        transactionId: validatedTransactionId,
        currentPaymentId: payment.id,
        existingPaymentId: duplicateTransaction.paymentId,
      });

      // Store this webhook for manual review
      await prisma.paymentWebhook.create({
        data: {
          id: `webhook_${validatedTransactionId}_duplicate_${Date.now()}`,
          paymentId: payment.id,
          paymobTransactionId: BigInt(validatedTransactionId),
          webhookPayload: webhookData as InputJsonValue,
          lastError: `Duplicate transaction ID - already processed for payment ${duplicateTransaction.paymentId}`,
          processingAttempts: 1,
        },
      });

      return createErrorResponse(
        "DUPLICATE_TRANSACTION",
        "Duplicate transaction ID detected",
        409
      );
    }

    // Determine new payment status
    const newStatus = processedData.isSuccess ? "COMPLETED" : "FAILED";
    const completedAt = processedData.isSuccess ? new Date() : null;
    const failureReason = !processedData.isSuccess
      ? "Payment failed at PayMob gateway"
      : null;

    // R.A.K.A.N'S NOTE: Execute payment update and enrollment creation in a single transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create or update webhook record using upsert for better atomicity
      const webhookId = existingWebhook?.id || `webhook_${validatedTransactionId}_${Date.now()}`;

      await tx.paymentWebhook.upsert({
        where: { id: webhookId },
        create: {
          id: webhookId,
          paymentId: payment.id,
          paymobTransactionId: BigInt(validatedTransactionId),
          webhookPayload: webhookData as InputJsonValue,
          processedAt: new Date(),
          processingAttempts: 1,
        },
        update: {
          webhookPayload: webhookData as InputJsonValue,
          processedAt: new Date(),
          processingAttempts: existingWebhook ? existingWebhook.processingAttempts + 1 : 1,
          lastError: null,
        },
      });

      // R.A.K.A.N'S NOTE: Safe JSON field handling - check if paymobResponse exists and is an object
      const existingPaymobResponse = (payment.paymobResponse && typeof payment.paymobResponse === 'object') 
        ? payment.paymobResponse as Record<string, unknown>
        : {};

      // Create webhook data that's compatible with InputJsonValue
      const webhookResponseData = {
        transactionId: validatedTransactionId,
        success: processedData.isSuccess,
        amountCents: processedData.amountCents,
        currency: processedData.currency,
        processedAt: new Date().toISOString(),
        rawData: JSON.parse(JSON.stringify(webhookData)), // Serialize to ensure compatibility
      };

      // Update payment record
      const updatedPayment: Payment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTransactionId: BigInt(validatedTransactionId),
          completedAt,
          failureReason,
          paymobResponse: {
            ...existingPaymobResponse,
            webhook: webhookResponseData,
          } as InputJsonValue,
        },
      });

      // For successful payments, create enrollment within the same transaction
      let enrollmentResult = null;
      if (processedData.isSuccess) {
        try {
          // Check if enrollment already exists
          const existingEnrollment = await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: payment.userId,
                courseId: payment.courseId,
              },
            },
          });

          if (!existingEnrollment) {
            // Create enrollment
            const newEnrollment = await tx.enrollment.create({
              data: {
                userId: payment.userId,
                courseId: payment.courseId,
                progressPercent: 0,
                completedLessonIds: [],
                totalWatchTime: 0,
                enrolledAt: new Date(),
                lastAccessedAt: null,
              },
            });

            // Create progress milestone
            await tx.progressMilestone.create({
              data: {
                userId: payment.userId,
                courseId: payment.courseId,
                milestoneType: "COURSE_START",
                metadata: {
                  paymentId: payment.id,
                  enrollmentId: newEnrollment.id,
                  courseName: payment.course.title,
                  amount: Number(payment.amount),
                  webhookTransactionId: validatedTransactionId,
                } as InputJsonValue,
              },
            });

            enrollmentResult = {
              success: true,
              enrollmentId: newEnrollment.id,
              created: true,
            };

            console.log("Enrollment created within transaction:", {
              enrollmentId: newEnrollment.id,
              paymentId: payment.id,
              userId: payment.userId,
              courseId: payment.courseId,
            });
          } else {
            enrollmentResult = {
              success: true,
              enrollmentId: existingEnrollment.id,
              created: false,
            };

            console.log("Enrollment already exists:", {
              enrollmentId: existingEnrollment.id,
              paymentId: payment.id,
            });
          }
        } catch (enrollmentError) {
          console.error(
            "Enrollment creation failed within transaction:",
            enrollmentError
          );

          // R.A.K.A.N'S NOTE: Safe JSON field handling for enrollment error
          const updatedPaymobResponse = (updatedPayment.paymobResponse && typeof updatedPayment.paymobResponse === 'object')
            ? updatedPayment.paymobResponse as Record<string, unknown>
            : {};

          // Store enrollment error in payment record for manual review
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              paymobResponse: {
                ...updatedPaymobResponse,
                enrollmentError: {
                  error:
                    enrollmentError instanceof Error
                      ? enrollmentError.message
                      : "Unknown error",
                  timestamp: new Date().toISOString(),
                  requiresManualReview: true,
                },
              } as InputJsonValue,
            },
          });

          // Don't throw - let payment complete but flag for manual enrollment
          enrollmentResult = {
            success: false,
            error:
              enrollmentError instanceof Error
                ? enrollmentError.message
                : "Unknown error",
            requiresManualReview: true,
          };
        }
      }

      return {
        payment: updatedPayment,
        enrollment: enrollmentResult,
      };
    }, {
      timeout: 30000, // 30 second timeout
    });

    console.log("Payment webhook processed:", {
      paymentId: payment.id,
      status: newStatus,
      transactionId: validatedTransactionId,
      success: processedData.isSuccess,
      enrollmentCreated: transactionResult.enrollment?.success || false,
      enrollmentId: transactionResult.enrollment?.enrollmentId,
      enrollmentRequiresManualReview:
        transactionResult.enrollment?.requiresManualReview || false,
    });

    return createSuccessResponse({
      paymentId: payment.id,
      status: newStatus,
      transactionId: validatedTransactionId,
      enrollment: {
        created: transactionResult.enrollment?.success || false,
        enrollmentId: transactionResult.enrollment?.enrollmentId,
        requiresManualReview: transactionResult.enrollment?.requiresManualReview || false,
      },
    }, "Webhook processed successfully");
    
  } catch (error) {
    console.error("PayMob webhook processing error:", error);

    // R.A.K.A.N'S NOTE: Guaranteed error logging - always create a paymentWebhook record upon critical failure
    if (transactionId && webhookData) {
      try {
        await prisma.paymentWebhook.upsert({
          where: { id: `webhook_${transactionId}_error_${Date.now()}` },
          create: {
            id: `webhook_${transactionId}_error_${Date.now()}`,
            paymentId: "error", // Will need manual linking
            paymobTransactionId: BigInt(transactionId),
            webhookPayload: webhookData as InputJsonValue,
            lastError: error instanceof Error ? error.message : "Unknown error",
            processingAttempts: 1,
          },
          update: {
            processingAttempts: { increment: 1 },
            lastError: error instanceof Error ? error.message : "Unknown error",
            webhookPayload: webhookData as InputJsonValue,
          },
        });
      } catch (dbError) {
        console.error("Failed to store error webhook:", dbError);
      }
    }

    return createSuccessResponse({
      message: "Webhook received but processing failed",
      error: error instanceof Error ? error.message : "Unknown error",
      transactionId,
    });
  }
}

// GET /api/payments/webhook - Health check for webhook endpoint
export async function GET() {
  return createSuccessResponse({
    message: "PayMob webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
