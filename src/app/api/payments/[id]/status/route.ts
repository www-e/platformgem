// src/app/api/payments/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: { id: string }
}

// GET /api/payments/[id]/status - Check payment status
export async function GET(request: NextRequest, { params }: RouteParams) {
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
            title: true,
            thumbnailUrl: true,
            professor: {
              select: {
                name: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
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

    // Check if user can access this payment
    const canAccess = session.user.role === 'ADMIN' || payment.userId === session.user.id;
    
    if (!canAccess) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بعرض هذه العملية',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Check if user is enrolled (for completed payments)
    let isEnrolled = false;
    if (payment.status === 'COMPLETED') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: payment.userId,
            courseId: payment.courseId
          }
        }
      });
      isEnrolled = !!enrollment;
    }

    // Prepare response data
    const responseData = {
      id: payment.id,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      paymobOrderId: payment.paymobOrderId,
      paymobTxnId: payment.paymobTxnId,
      course: payment.course,
      isEnrolled,
      // Include additional info for debugging (admin only)
      ...(session.user.role === 'ADMIN' && {
        user: payment.user,
        paymobResponse: payment.paymobResponse
      })
    };

    return createSuccessResponse(responseData);

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