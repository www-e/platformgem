// src/app/api/admin/payments/stats/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    // Get payment statistics
    const [
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
    ] = await Promise.all([
      // Total payments count
      prisma.payment.count(),
      
      // Completed payments count
      prisma.payment.count({
        where: { status: 'COMPLETED' }
      }),
      
      // Pending payments count
      prisma.payment.count({
        where: { status: 'PENDING' }
      }),
      
      // Failed payments count
      prisma.payment.count({
        where: { status: 'FAILED' }
      }),
      
      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
    ]);

    const stats = {
      total: totalPayments,
      completed: completedPayments,
      pending: pendingPayments,
      failed: failedPayments,
      cancelled: 0, // Placeholder for now, we can add this later if needed
      totalRevenue: Number(totalRevenue._sum.amount || 0),
    };

    return createSuccessResponse(stats);

  } catch (error) {
    console.error('Payment statistics error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}