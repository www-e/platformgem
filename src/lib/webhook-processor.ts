// src/lib/webhook-processor.ts
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export interface WebhookPayload {
  type: string;
  obj: {
    id: string;
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
  };
}

export async function processWebhookPayload(payload: any, signature: string): Promise<void> {
  // Verify signature
  const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
  if (!hmacSecret) {
    throw new Error('PAYMOB_HMAC_SECRET not configured');
  }

  const expectedSignature = crypto
    .createHmac('sha512', hmacSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new Error('Invalid webhook signature');
  }

  // Validate payload structure
  if (!payload.type || !payload.obj) {
    throw new Error('Invalid webhook payload structure');
  }

  if (payload.type !== 'TRANSACTION') {
    // Ignore non-transaction webhooks
    return;
  }

  const transaction = payload.obj;
  
  if (!transaction.id || !transaction.order?.merchant_order_id) {
    throw new Error('Missing required transaction data');
  }

  const paymentId = transaction.order.merchant_order_id;

  // Find the payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      course: true
    }
  });

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  // Determine payment status based on transaction data
  let newStatus: string;
  let failureReason: string | null = null;

  if (transaction.success && !transaction.pending && !transaction.refunded) {
    newStatus = 'COMPLETED';
  } else if (transaction.pending) {
    newStatus = 'PROCESSING';
  } else if (transaction.refunded) {
    newStatus = 'REFUNDED';
  } else {
    newStatus = 'FAILED';
    failureReason = 'Payment failed at PayMob';
  }

  // Update payment
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: newStatus,
      paymobTransactionId: transaction.id,
      paymentMethod: transaction.source_data?.type?.toUpperCase() || 'CARD',
      failureReason,
      updatedAt: new Date()
    }
  });

  // Handle enrollment creation for completed payments
  if (newStatus === 'COMPLETED' && payment.status !== 'COMPLETED') {
    try {
      // Check if enrollment already exists
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            userId: payment.userId,
            courseId: payment.courseId,
            paymentId: payment.id,
            status: 'ACTIVE',
            enrolledAt: new Date()
          }
        });

        // Update course enrollment count
        await prisma.course.update({
          where: { id: payment.courseId },
          data: {
            enrollmentCount: {
              increment: 1
            }
          }
        });
      }
    } catch (enrollmentError) {
      console.error('Failed to create enrollment during webhook processing:', enrollmentError);
      // Don't throw error as payment was processed successfully
    }
  }

  console.log(`Webhook processed successfully for payment ${paymentId}: ${payment.status} -> ${newStatus}`);
}