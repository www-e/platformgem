// src/app/api/payments/[paymentId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ paymentId: string }>
}

// GET /api/payments/[paymentId]/status - Get payment status
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
      select: {
        id: true,
        status: true,
        amount: true,
        currency: true,
        userId: true,
        courseId: true,
        createdAt: true,
        updatedAt: true,
        failureReason: true,
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true
          }
        }
      }
    });

    if (!payment) {
      return createErrorResponse('PAYMENT_NOT_FOUND', 'Payment not found', 404);
    }

    // Security check: Only the owner or an admin can view the payment status
    const canAccess = session.user.role === 'ADMIN' || payment.userId === session.user.id;
    if (!canAccess) {
      return createErrorResponse(ApiErrors.FORBIDDEN.code, 'You do not have permission to view this payment', ApiErrors.FORBIDDEN.status);
    }

    const transformedPayment = {
      ...payment,
      amount: Number(payment.amount),
    };

    return createSuccessResponse(transformedPayment);

  } catch (error) {
    console.error('Payment status fetch error:', error);
    return createErrorResponse(ApiErrors.INTERNAL_ERROR.code, ApiErrors.INTERNAL_ERROR.message, ApiErrors.INTERNAL_ERROR.status, error);
  }
}