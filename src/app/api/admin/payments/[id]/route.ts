// src/app/api/admin/payments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EnrollmentService } from '@/lib/services/enrollment-service';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: { id: string }
}

// GET /api/admin/payments/[id] - Get detailed payment information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id: paymentId } = params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            price: true,
            currency: true,
            professor: {
              select: {
                name: true
              }
            }
          }
        },
        webhooks: {
          select: {
            id: true,
            paymobTransactionId: true,
            webhookPayload: true,
            processedAt: true,
            processingAttempts: true,
            lastError: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!payment) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'Payment not found',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check enrollment status
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId
        }
      },
      select: {
        id: true,
        enrolledAt: true,
        progressPercent: true
      }
    });

    // Transform the data
    const transformedPayment = {
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
      paymobOrderId: payment.paymobOrderId,
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
      paymobResponse: payment.paymobResponse,
      user: payment.user,
      course: {
        ...payment.course,
        price: Number(payment.course.price)
      },
      enrollment,
      webhooks: payment.webhooks.map(webhook => ({
        id: webhook.id,
        paymobTransactionId: Number(webhook.paymobTransactionId),
        processedAt: webhook.processedAt,
        processingAttempts: webhook.processingAttempts,
        lastError: webhook.lastError,
        createdAt: webhook.createdAt,
        webhookPayload: webhook.webhookPayload
      }))
    };

    return createSuccessResponse(transformedPayment);

  } catch (error) {
    console.error('Admin payment detail error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// PATCH /api/admin/payments/[id] - Update payment status or retry enrollment
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id: paymentId } = params;
    const body = await request.json();
    const { action, status, reason } = body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'Payment not found',
        ApiErrors.NOT_FOUND.status
      );
    }

    let result;

    switch (action) {
      case 'update_status':
        result = await prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: status.toUpperCase(),
            failureReason: reason || null,
            completedAt: status.toUpperCase() === 'COMPLETED' ? new Date() : null
          }
        });
        break;

      case 'retry_enrollment':
        if (payment.status !== 'COMPLETED') {
          return createErrorResponse(
            'INVALID_ACTION',
            'Cannot retry enrollment for non-completed payment',
            400
          );
        }

        const enrollmentResult = await EnrollmentService.retryFailedEnrollment(paymentId);
        
        if (!enrollmentResult.success) {
          return createErrorResponse(
            'ENROLLMENT_FAILED',
            enrollmentResult.message,
            400
          );
        }

        result = { enrollmentCreated: true, enrollmentId: enrollmentResult.enrollmentId };
        break;

      case 'manual_complete':
        result = await prisma.$transaction(async (tx) => {
          // Update payment status
          const updatedPayment = await tx.payment.update({
            where: { id: paymentId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
              failureReason: null
            }
          });

          // Create enrollment if it doesn't exist
          const existingEnrollment = await tx.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId: payment.userId,
                courseId: payment.courseId
              }
            }
          });

          if (!existingEnrollment) {
            await tx.enrollment.create({
              data: {
                userId: payment.userId,
                courseId: payment.courseId,
                progressPercent: 0,
                completedLessonIds: [],
                totalWatchTime: 0
              }
            });
          }

          return updatedPayment;
        });
        break;

      default:
        return createErrorResponse(
          'INVALID_ACTION',
          'Invalid action specified',
          400
        );
    }

    return createSuccessResponse({
      message: 'Payment updated successfully',
      payment: result
    });

  } catch (error) {
    console.error('Admin payment update error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}