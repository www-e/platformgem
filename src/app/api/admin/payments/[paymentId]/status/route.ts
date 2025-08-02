// src/app/api/admin/payments/[paymentId]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { paymentId } = params;
    const body = await request.json();
    const { status, reason } = body;

    // Validate status
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return createErrorResponse(
        'INVALID_STATUS',
        'Invalid payment status provided',
        400
      );
    }

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

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        failureReason: status === 'FAILED' ? reason : null,
        updatedAt: new Date()
      }
    });

    // Handle enrollment creation for completed payments
    if (status === 'COMPLETED' && payment.status !== 'COMPLETED') {
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
        console.error('Failed to create enrollment:', enrollmentError);
        // Don't fail the status update if enrollment creation fails
      }
    }

    // Handle enrollment deactivation for cancelled/failed payments
    if ((status === 'CANCELLED' || status === 'FAILED') && payment.status === 'COMPLETED') {
      try {
        await prisma.enrollment.updateMany({
          where: {
            userId: payment.userId,
            courseId: payment.courseId,
            paymentId: payment.id
          },
          data: {
            status: 'CANCELLED'
          }
        });

        // Update course enrollment count
        await prisma.course.update({
          where: { id: payment.courseId },
          data: {
            enrollmentCount: {
              decrement: 1
            }
          }
        });
      } catch (enrollmentError) {
        console.error('Failed to update enrollment:', enrollmentError);
      }
    }

    return createSuccessResponse({
      payment: {
        ...updatedPayment,
        amount: Number(updatedPayment.amount)
      },
      message: `Payment status updated to ${status}`
    });

  } catch (error) {
    console.error('Payment status update error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}