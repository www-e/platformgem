// src/app/api/payments/[paymentId]/retry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';
import { PayMobService } from '@/lib/paymob';

export async function POST(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { paymentId } = params;

    // Find the payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        course: true
      }
    });

    if (!payment) {
      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'Payment not found',
        404
      );
    }

    // Check if user owns this payment (unless admin)
    if (session.user.role !== 'ADMIN' && payment.userId !== session.user.id) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        'You can only retry your own payments',
        ApiErrors.UNAUTHORIZED.status
      );
    }

    // Check if payment can be retried
    if (payment.status !== 'FAILED' && payment.status !== 'CANCELLED') {
      return createErrorResponse(
        'PAYMENT_NOT_RETRYABLE',
        'Only failed or cancelled payments can be retried',
        400
      );
    }

    // Reset payment status and clear error information
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PENDING',
        failureReason: null,
        paymobTransactionId: null,
        updatedAt: new Date()
      }
    });

    // Initialize PayMob service and create new payment intent
    const payMobService = new PayMobService();
    
    try {
      const paymentIntent = await payMobService.createPaymentIntent({
        amount: Number(payment.amount),
        currency: payment.currency,
        orderId: payment.id,
        customerInfo: {
          email: payment.user.email,
          firstName: payment.user.name?.split(' ')[0] || 'Student',
          lastName: payment.user.name?.split(' ').slice(1).join(' ') || '',
          phone: payment.user.phone || ''
        },
        items: [{
          name: payment.course.title,
          amount: Number(payment.amount),
          description: payment.course.shortDescription || payment.course.description,
          quantity: 1
        }]
      });

      // Update payment with new PayMob data
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymobOrderId: paymentIntent.orderId,
          paymobPaymentKey: paymentIntent.paymentKey,
          status: 'PROCESSING'
        }
      });

      return createSuccessResponse({
        paymentUrl: paymentIntent.paymentUrl,
        paymentKey: paymentIntent.paymentKey,
        message: 'Payment retry initiated successfully'
      });

    } catch (paymobError) {
      console.error('PayMob payment retry failed:', paymobError);
      
      // Update payment status back to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          failureReason: 'PayMob integration error during retry'
        }
      });

      return createErrorResponse(
        'PAYMOB_ERROR',
        'Failed to initialize payment with PayMob',
        500
      );
    }

  } catch (error) {
    console.error('Payment retry error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}