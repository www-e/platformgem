// src/app/api/admin/payments/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
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
      monthlyRevenue
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
      
      // Monthly revenue (current month)
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { amount: true }
      })
    ]);

    // Get daily revenue for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyRevenue = await prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        amount: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Process daily revenue data
    const revenueChart = dailyRevenue.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      revenue: Number(item._sum.amount || 0)
    }));

    // Get payment method distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: { status: 'COMPLETED' },
      _count: true,
      _sum: { amount: true }
    });

    const methodDistribution = paymentMethods.map(method => ({
      method: method.paymentMethod || 'UNKNOWN',
      count: method._count,
      revenue: Number(method._sum.amount || 0)
    }));

    // Calculate success rate
    const successRate = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

    const stats = {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      successRate: Math.round(successRate * 100) / 100,
      revenueChart,
      methodDistribution,
      averageOrderValue: completedPayments > 0 ? 
        Number(totalRevenue._sum.amount || 0) / completedPayments : 0
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