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
    const merchantOrderId = searchParams.get('merchantOrderId');
    const transactionId = searchParams.get('transactionId');

    console.log('🔍 Check-status API called with:', {
      courseId,
      merchantOrderId,
      transactionId,
      userId: session.user.id
    });

    // Build where conditions based on available parameters
    const whereConditions: any[] = [];
    
    if (courseId) {
      whereConditions.push({
        userId: session.user.id,
        courseId: courseId,
      });
    }
    
    if (merchantOrderId) {
      whereConditions.push({
        userId: session.user.id,
        paymobOrderId: merchantOrderId,
      });
    }
    
    if (transactionId) {
      // Handle both string and BigInt transaction IDs
      const transactionIdBigInt = BigInt(transactionId);
      whereConditions.push({
        userId: session.user.id,
        paymobTransactionId: transactionIdBigInt,
      });
    }

    if (whereConditions.length === 0) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        'يجب توفير معرف الدورة أو معرف الطلب أو معرف المعاملة',
        ApiErrors.VALIDATION_ERROR.status
      );
    }

    // Find the most recent payment using OR conditions
    const payment = await prisma.payment.findFirst({
      where: {
        OR: whereConditions,
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
      console.log('❌ Payment not found with provided parameters');
      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'لم يتم العثور على عملية دفع',
        404
      );
    }

    // Security check: Ensure the payment belongs to the current user
    if (payment.userId !== session.user.id) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'لا يمكنك عرض هذه المعاملة',
        ApiErrors.FORBIDDEN.status
      );
    }

    console.log('✅ Payment found:', {
      paymentId: payment.id,
      status: payment.status,
      courseId: payment.courseId,
      transactionId: payment.paymobTransactionId?.toString(),
      createdAt: payment.createdAt,
      timeSinceCreation: Date.now() - payment.createdAt.getTime()
    });

    // Handle race condition: if payment is very recent and still pending,
    // add a flag to suggest polling
    const timeSinceCreation = Date.now() - payment.createdAt.getTime();
    const isRecentPendingPayment = payment.status === 'PENDING' && timeSinceCreation < 60000; // Less than 1 minute

    // Transform the payment data to ensure Decimal values are converted
    const transformedPayment = {
      ...payment,
      amount: Number(payment.amount),
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
      // Add metadata for frontend race condition handling
      _metadata: {
        timeSinceCreation,
        isRecentPending: isRecentPendingPayment,
        shouldPoll: isRecentPendingPayment,
        pollIntervalMs: isRecentPendingPayment ? 3000 : null
      }
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