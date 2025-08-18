// src/app/api/payments/check-status/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        'معرف الدورة مطلوب',
        ApiErrors.VALIDATION_ERROR.status
      );
    }

    // Find the most recent payment for this user and course
    const payment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!payment) {
      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'لم يتم العثور على عملية دفع',
        404
      );
    }

    // Transform the payment data to ensure Decimal values are converted
    const transformedPayment = {
      ...payment,
      amount: Number(payment.amount),
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
    };

    return createSuccessResponse(transformedPayment);

  } catch (error) {
    console.error('Payment status check error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}