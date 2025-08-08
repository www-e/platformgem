// src/app/api/payments/webhook/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { payMobService } from "@/lib/paymob/client";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-utils";
import { 
  createStandardErrorResponse, 
  createStandardSuccessResponse,
  API_ERROR_CODES 
} from "@/lib/api-error-handler";
// Webhook retry configuration
const WEBHOOK_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelays: [1000, 5000, 15000], // 1s, 5s, 15s
};

/**
 * Process webhook with retry mechanism for transient failures
 */
async function processWebhookWithRetry(
  payment: any,
  processedData: any,
  webhookData: any,
  validatedTransactionId: number,
  existingWebhook: any,
  retryCount = 0
): Promise<any> {
  try {
    // Your existing transaction code will go here
    // We'll move the main transaction logic into this function
    
    // Determine new payment status
    const newStatus = processedData.isSuccess ? "COMPLETED" : "FAILED";
    const completedAt = processedData.isSuccess ? new Date() : null;
    const failureReason = !processedData.isSuccess
      ? "Payment failed at PayMob gateway"
      : null;

    // Execute payment update and enrollment creation in a single transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create or update webhook record
      const webhookId =
        existingWebhook?.id ||
        `webhook_${validatedTransactionId}_${Date.now()}`;

      if (existingWebhook) {
        await tx.paymentWebhook.update({
          where: { id: existingWebhook.id },
          data: {
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: existingWebhook.processingAttempts + 1,
            lastError: null,
          },
        });
      } else {
        await tx.paymentWebhook.create({
          data: {
            id: webhookId,
            paymentId: payment.id,
            paymobTransactionId: BigInt(validatedTransactionId),
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: 1,
          },
        });
      }

      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTransactionId: BigInt(validatedTransactionId),
          completedAt,
          failureReason,
          paymobResponse: {
            ...(payment.paymobResponse as any),
            webhook: {
              transactionId: validatedTransactionId,
              success: processedData.isSuccess,
              amountCents: processedData.amountCents,
              currency: processedData.currency,
              processedAt: new Date().toISOString(),
              rawData: webhookData,
              retryCount,
            },
          },
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
                milestoneType: 'COURSE_START',
                metadata: {
                  paymentId: payment.id,
                  enrollmentId: newEnrollment.id,
                  courseName: payment.course.title,
                  amount: Number(payment.amount),
                  webhookTransactionId: validatedTransactionId,
                  retryCount,
                },
              },
            });

            enrollmentResult = {
              success: true,
              enrollmentId: newEnrollment.id,
              created: true,
            };

            console.log('Enrollment created within transaction:', {
              enrollmentId: newEnrollment.id,
              paymentId: payment.id,
              userId: payment.userId,
              courseId: payment.courseId,
              retryCount,
            });
          } else {
            enrollmentResult = {
              success: true,
              enrollmentId: existingEnrollment.id,
              created: false,
            };

            console.log('Enrollment already exists:', {
              enrollmentId: existingEnrollment.id,
              paymentId: payment.id,
              retryCount,
            });
          }
        } catch (enrollmentError) {
          console.error('Enrollment creation failed within transaction:', enrollmentError);
          
          // Store enrollment error in payment record for manual review
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              paymobResponse: {
                ...(updatedPayment.paymobResponse as any),
                enrollmentError: {
                  error: enrollmentError instanceof Error ? enrollmentError.message : 'Unknown error',
                  timestamp: new Date().toISOString(),
                  requiresManualReview: true,
                  retryCount,
                },
              },
            },
          });

          // Don't throw - let payment complete but flag for manual enrollment
          enrollmentResult = {
            success: false,
            error: enrollmentError instanceof Error ? enrollmentError.message : 'Unknown error',
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

    return transactionResult;

  } catch (error) {
    console.error(`Webhook processing failed (attempt ${retryCount + 1}):`, error);
    
    // Check if this is a retryable error
    const isRetryableError = 
      error instanceof Error && (
        error.message.includes('timeout') ||
        error.message.includes('connection') ||
        error.message.includes('deadlock') ||
        error.message.includes('serialization')
      );

    if (isRetryableError && retryCount < WEBHOOK_RETRY_CONFIG.maxRetries) {
      console.log(`Retrying webhook processing in ${WEBHOOK_RETRY_CONFIG.retryDelays[retryCount]}ms...`);
      
      // Wait before retry
      await new Promise(resolve => 
        setTimeout(resolve, WEBHOOK_RETRY_CONFIG.retryDelays[retryCount])
      );
      
      // Retry with incremented count
      return processWebhookWithRetry(
        payment,
        processedData,
        webhookData,
        validatedTransactionId,
        existingWebhook,
        retryCount + 1
      );
    }

    // Non-retryable error or max retries exceeded
    throw error;
  }
}
// POST /api/payments/webhook - Handle PayMob webhook notifications
export async function POST(request: NextRequest) {
  let webhookData: any;
  let transactionId: number | null = null;

  try {
    // Parse webhook data
    webhookData = await request.json();
    transactionId = webhookData?.obj?.id ?? null;

    console.log("PayMob webhook received:", {
      transactionId: transactionId,
      orderId: webhookData?.obj?.order?.id,
      success: webhookData?.obj?.success,
      amount: webhookData?.obj?.amount_cents,
      timestamp: new Date().toISOString(),
    });

    // We process the 'obj' part of the payload
    const webhookObject = webhookData.obj;

    // Validate webhook payload structure
    if (!payMobService.validateWebhookPayload(webhookObject)) {
      console.error("Invalid webhook payload structure:", webhookObject);
      return createStandardErrorResponse(
        API_ERROR_CODES.WEBHOOK_PAYLOAD_INVALID,
        "Invalid webhook payload structure",
        400,
        { receivedPayload: webhookObject }
      );
      
    }

    // Verify webhook signature
    const isValidSignature = await payMobService.verifyWebhookSignature(
      webhookObject
    );
    if (!isValidSignature) {
      console.error(
        "Invalid PayMob webhook signature for transaction:",
        transactionId
      );
      return createStandardErrorResponse(
        API_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID,
        "Invalid webhook signature",
        401,
        { transactionId: transactionId }
      );
      
    }

    // Process webhook data
    const processedData = await payMobService.processWebhook(webhookObject);

    // Validate processed data
    if (!processedData.isValid) {
      console.error("Invalid webhook data processing");
      return createErrorResponse(
        "WEBHOOK_INVALID",
        "Invalid webhook data",
        400
      );
    }

    // *** FIX: Ensure transactionId is valid before proceeding ***
    if (!processedData.transactionId) {
      console.error("Missing transaction ID in webhook data");
      return createErrorResponse(
        "WEBHOOK_MISSING_DATA",
        "Missing transaction ID",
        400
      );
    }

    const validatedTransactionId = processedData.transactionId; // Now we know it's a number

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
            webhookPayload: webhookData,
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
    const existingWebhook = await prisma.paymentWebhook.findFirst({
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
    const duplicateTransaction = await prisma.paymentWebhook.findFirst({
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
          webhookPayload: webhookData,
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

    // Execute payment update and enrollment creation in a single transaction
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Create or update webhook record
      const webhookId =
        existingWebhook?.id ||
        `webhook_${validatedTransactionId}_${Date.now()}`;

      if (existingWebhook) {
        await tx.paymentWebhook.update({
          where: { id: existingWebhook.id },
          data: {
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: existingWebhook.processingAttempts + 1,
            lastError: null,
          },
        });
      } else {
        await tx.paymentWebhook.create({
          data: {
            id: webhookId,
            paymentId: payment.id,
            paymobTransactionId: BigInt(validatedTransactionId),
            webhookPayload: webhookData,
            processedAt: new Date(),
            processingAttempts: 1,
          },
        });
      }

      // Update payment record
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          paymobTransactionId: BigInt(validatedTransactionId),
          completedAt,
          failureReason,
          paymobResponse: {
            ...(payment.paymobResponse as any),
            webhook: {
              transactionId: validatedTransactionId,
              success: processedData.isSuccess,
              amountCents: processedData.amountCents,
              currency: processedData.currency,
              processedAt: new Date().toISOString(),
              rawData: webhookData,
            },
          },
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
                },
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

          // Store enrollment error in payment record for manual review
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              paymobResponse: {
                ...(updatedPayment.paymobResponse as any),
                enrollmentError: {
                  error:
                    enrollmentError instanceof Error
                      ? enrollmentError.message
                      : "Unknown error",
                  timestamp: new Date().toISOString(),
                  requiresManualReview: true,
                },
              },
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

    return createStandardSuccessResponse({
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

    // *** FIX: Use correct `transactionId` variable and check if it exists ***
    if (transactionId && webhookData) {
      try {
        await prisma.paymentWebhook.upsert({
          where: { id: `webhook_${transactionId}_error_${Date.now()}` },
          create: {
            id: `webhook_${transactionId}_error_${Date.now()}`,
            paymentId: "error", // Will need manual linking
            paymobTransactionId: BigInt(transactionId),
            webhookPayload: webhookData,
            lastError: error instanceof Error ? error.message : "Unknown error",
            processingAttempts: 1,
          },
          update: {
            processingAttempts: { increment: 1 },
            lastError: error instanceof Error ? error.message : "Unknown error",
            webhookPayload: webhookData,
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
