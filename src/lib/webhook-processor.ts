// src/lib/webhook-processor.ts
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { PaymentStatus } from "@prisma/client"; // Import the enum

// Define a precise type for the webhook payload object
interface WebhookTransactionObject {
  id: number;
  amount_cents: number;
  currency: string;
  success: boolean;
  pending?: boolean;
  refunded?: boolean;
  order?: {
    merchant_order_id: string;
  };
  source_data?: {
    type: string;
    pan?: string;
  };
}

// Define the overall payload structure
export interface WebhookPayload {
  type: string;
  obj: WebhookTransactionObject;
}

function isWebhookPayload(payload: unknown): payload is WebhookPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'type' in payload &&
    'obj' in payload &&
    typeof (payload as { obj: unknown }).obj === 'object' &&
    (payload as { obj: unknown }).obj !== null
  );
}

export async function processWebhookPayload(
  payload: unknown,
  signature: string
): Promise<void> {
  // Verify signature
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    throw new Error("PAYMOB_HMAC_SECRET not configured");
  }

  const expectedSignature = crypto
    .createHmac("sha512", hmacSecret)
    .update(JSON.stringify(payload))
    .digest("hex");

  if (signature !== expectedSignature) {
    throw new Error("Invalid webhook signature");
  }

  // Validate payload structure using the type guard
  if (!isWebhookPayload(payload)) {
    throw new Error("Invalid webhook payload structure");
  }

  if (payload.type !== "TRANSACTION") {
    // Ignore non-transaction webhooks
    return;
  }

  const transaction = payload.obj;

  if (!transaction.id || !transaction.order?.merchant_order_id) {
    throw new Error("Missing required transaction data");
  }

  const paymentId = transaction.order.merchant_order_id;

  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      course: true,
    },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  // Determine payment status based on transaction data
  let newStatus: PaymentStatus; // Use the PaymentStatus enum
  let failureReason: string | null = null;

  if (transaction.success && !transaction.pending && !transaction.refunded) {
    newStatus = PaymentStatus.COMPLETED;
  } else if (transaction.pending) {
    newStatus = PaymentStatus.PENDING; // or PaymentStatus.PROCESSING if you have it
  } else if (transaction.refunded) {
    newStatus = PaymentStatus.REFUNDED;
  } else {
    newStatus = PaymentStatus.FAILED;
    failureReason = "Payment failed at PayMob";
  }

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: newStatus,
      paymobTransactionId: BigInt(transaction.id), // Ensure it's BigInt
      paymentMethod: transaction.source_data?.type?.toUpperCase() || "CARD",
      failureReason,
      updatedAt: new Date(),
    },
  });

  // Handle enrollment creation for completed payments
  if (newStatus === PaymentStatus.COMPLETED && payment.status !== PaymentStatus.COMPLETED) {
    try {
      // Check if enrollment already exists
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
          },
        });

        // Course enrollment count is calculated via _count.enrollments
      }
    } catch (enrollmentError) {
      console.error(
        "Failed to create enrollment during webhook processing:",
        enrollmentError
      );
      // Don't throw error as payment was processed successfully
    }
  }

  console.log(
    `Webhook processed successfully for payment ${paymentId}: ${payment.status} -> ${newStatus}`
  );
}
