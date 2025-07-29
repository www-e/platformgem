// src/app/api/payments/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { payMobService } from '@/lib/paymob';
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

    // Find payment record with webhooks
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
        },
        webhooks: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Get last 5 webhooks for debugging
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

    // For pending payments, optionally verify with PayMob API
    let paymobStatus = null;
    if (payment.status === 'PENDING' && payment.paymobOrderId) {
      try {
        // This would require implementing a PayMob status check API call
        // For now, we'll rely on webhook updates
        console.log('Payment still pending, relying on webhook updates');
      } catch (error) {
        console.error('Failed to check PayMob status:', error);
      }
    }

    // Determine display status and message
    let displayStatus = payment.status;
    let statusMessage = '';
    let nextAction = '';

    switch (payment.status) {
      case 'PENDING':
        statusMessage = 'عملية الدفع قيد المعالجة';
        nextAction = 'يرجى الانتظار حتى اكتمال المعالجة';
        break;
      case 'COMPLETED':
        if (enrollment) {
          statusMessage = 'تم الدفع بنجاح وتم تسجيلك في الدورة';
          nextAction = 'يمكنك الآن الوصول إلى محتوى الدورة';
        } else {
          statusMessage = 'تم الدفع بنجاح ولكن لم يتم التسجيل في الدورة';
          nextAction = 'يرجى التواصل مع الدعم الفني';
        }
        break;
      case 'FAILED':
        statusMessage = 'فشلت عملية الدفع';
        nextAction = 'يمكنك المحاولة مرة أخرى أو التواصل مع الدعم الفني';
        break;
      default:
        statusMessage = 'حالة غير معروفة';
        nextAction = 'يرجى التواصل مع الدعم الفني';
    }

    // Prepare response data
    const responseData = {
      paymentId: payment.id,
      status: displayStatus,
      statusMessage,
      nextAction,
      amount: Number(payment.amount),
      currency: payment.currency,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
      course: {
        id: payment.course.id,
        title: payment.course.title,
        thumbnailUrl: payment.course.thumbnailUrl,
        professor: payment.course.professor.name
      },
      enrollment: enrollment ? {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        progressPercent: enrollment.progressPercent
      } : null,
      // Include webhook info for debugging (admin only)
      ...(session.user.role === 'ADMIN' && {
        user: payment.user,
        webhooks: payment.webhooks.map(webhook => ({
          id: webhook.id,
          transactionId: Number(webhook.paymobTransactionId),
          processedAt: webhook.processedAt,
          processingAttempts: webhook.processingAttempts,
          lastError: webhook.lastError
        })),
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