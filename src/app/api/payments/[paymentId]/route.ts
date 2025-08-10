// src/app/api/payments/[paymentId]/route.ts
import { NextRequest} from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { payMobService } from '@/lib/paymob/client';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ paymentId: string }>
}

// GET /api/payments/[paymentId] - Get payment details and status
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse(ApiErrors.UNAUTHORIZED.code, ApiErrors.UNAUTHORIZED.message, ApiErrors.UNAUTHORIZED.status);
    }

    const { paymentId } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            professor: { select: { name: true } }
          }
        }
      }
    });

    if (!payment) {
      return createErrorResponse('PAYMENT_NOT_FOUND', 'Payment not found', 404);
    }

    // Security check: Only the owner or an admin can view the payment details
    const canAccess = session.user.role === 'ADMIN' || payment.userId === session.user.id;
    if (!canAccess) {
      return createErrorResponse(ApiErrors.FORBIDDEN.code, 'You do not have permission to view this payment', ApiErrors.FORBIDDEN.status);
    }

    const transformedPayment = {
      ...payment,
      amount: Number(payment.amount),
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
    };

    return createSuccessResponse(transformedPayment);

  } catch (error) {
    console.error('Payment details fetch error:', error);
    return createErrorResponse(ApiErrors.INTERNAL_ERROR.code, ApiErrors.INTERNAL_ERROR.message, ApiErrors.INTERNAL_ERROR.status, error);
  }
}

// POST /api/payments/[paymentId] - Handle actions like retry and cancel
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse(ApiErrors.UNAUTHORIZED.code, ApiErrors.UNAUTHORIZED.message, ApiErrors.UNAUTHORIZED.status);
    }

    const { paymentId } = await params;
    const body = await request.json();
    const { action } = body; // We expect an 'action' field in the request body

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true, course: true }
    });

    if (!payment) {
      return createErrorResponse('PAYMENT_NOT_FOUND', 'Payment not found', 404);
    }

    const canAccess = session.user.role === 'ADMIN' || payment.userId === session.user.id;
    if (!canAccess) {
      return createErrorResponse(ApiErrors.FORBIDDEN.code, 'You do not have permission to modify this payment', ApiErrors.FORBIDDEN.status);
    }

    // --- Action Handler ---
    switch (action) {
      case 'retry':
        if (payment.status !== 'FAILED' && payment.status !== 'CANCELLED') {
          return createErrorResponse('PAYMENT_NOT_RETRYABLE', 'Only failed or cancelled payments can be retried', 400);
        }
        
        // This logic is moved from the old retry route
        const paymentIntent = await payMobService.initiatePayment(
          {
            amount_cents: payMobService.formatAmount(Number(payment.amount)),
            currency: payment.currency,
            merchant_order_id: payment.id, // Use the existing payment ID
            items: [{
              name: payment.course.title,
              amount_cents: payMobService.formatAmount(Number(payment.amount)),
              description: payment.course.description || payment.course.title,
              quantity: 1
            }],
            billing_data: payMobService.createBillingData({
              name: payment.user.name || 'User',
              email: payment.user.email || undefined,
              phone: payment.user.phone
            })
          },
          payment.courseId,
          'credit-card' // Default to credit card for retry
        );

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'PENDING',
            failureReason: null,
            paymobOrderId: paymentIntent.orderId?.toString() || payment.id,
            paymobResponse: { 
              ...payment.paymobResponse as object, 
              iframeUrl: paymentIntent.iframeUrl,
              paymentKey: paymentIntent.paymentKey,
              paymentMethod: paymentIntent.paymentMethod
            }
          }
        });

        return createSuccessResponse({
          iframeUrl: paymentIntent.iframeUrl,
          message: 'Payment retry initiated successfully'
        });

      case 'cancel':
        if (payment.status !== 'PENDING') {
          return createErrorResponse('CANNOT_CANCEL', `Cannot cancel a payment with status ${payment.status}`, 400);
        }

        // This logic is moved from the old cancel route
        const updatedPayment = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: 'CANCELLED',
            failureReason: 'Cancelled by user',
          }
        });
        
        return createSuccessResponse({
          paymentId: updatedPayment.id,
          status: updatedPayment.status,
        });

      default:
        return createErrorResponse('INVALID_ACTION', 'The requested action is not valid.', 400);
    }

  } catch (error) {
    console.error(`Payment action error:`, error);
    return createErrorResponse(ApiErrors.INTERNAL_ERROR.code, ApiErrors.INTERNAL_ERROR.message, ApiErrors.INTERNAL_ERROR.status, error);
  }
}