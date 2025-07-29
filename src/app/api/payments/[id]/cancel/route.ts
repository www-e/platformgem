// src/app/api/payments/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: { id: string }
}

// POST /api/payments/[id]/cancel - Cancel a pending payment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id: paymentId } = params;

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!payment) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'عملية الدفع غير موجودة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check if user can cancel this payment
    const canCancel = session.user.role === 'ADMIN' || payment.userId === session.user.id;
    
    if (!canCancel) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بإلغاء هذه العملية',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Check if payment can be cancelled
    if (payment.status !== 'PENDING') {
      return createErrorResponse(
        'CANNOT_CANCEL',
        `لا يمكن إلغاء عملية دفع بحالة ${payment.status}`,
        400
      );
    }

    // Cancel the payment
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'CANCELLED',
        failureReason: 'Cancelled by user',
        completedAt: new Date()
      }
    });

    console.log('Payment cancelled by user:', {
      paymentId: updatedPayment.id,
      userId: session.user.id,
      courseId: payment.courseId
    });

    return createSuccessResponse({
      paymentId: updatedPayment.id,
      status: updatedPayment.status,
      cancelledAt: updatedPayment.completedAt,
      course: payment.course
    });

  } catch (error) {
    console.error('Payment cancellation error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}