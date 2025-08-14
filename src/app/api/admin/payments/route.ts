// src/app/api/admin/payments/route.ts
import { NextRequest} from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication and admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        {
          course: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          paymobOrderId: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];

      // Add transaction ID search if it's a number
      const transactionId = parseInt(search);
      if (!isNaN(transactionId)) {
        where.OR.push({
          paymobTransactionId: BigInt(transactionId)
        });
      }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Get payments with related data
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
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
          webhooks: {
            select: {
              id: true,
              processedAt: true,
              processingAttempts: true,
              lastError: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    // Transform payments data
    const transformedPayments = payments.map(payment => ({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      createdAt: payment.createdAt,
      completedAt: payment.completedAt,
      failureReason: payment.failureReason,
      paymobOrderId: payment.paymobOrderId,
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
      user: payment.user,
      course: payment.course,
      lastWebhook: payment.webhooks[0] || null
    }));

    // Calculate summary statistics
    const stats = await prisma.payment.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    const summary = {
      total: totalCount,
      completed: stats.find(s => s.status === 'COMPLETED')?._count.id || 0,
      pending: stats.find(s => s.status === 'PENDING')?._count.id || 0,
      failed: stats.find(s => s.status === 'FAILED')?._count.id || 0,
      cancelled: stats.find(s => s.status === 'CANCELLED')?._count.id || 0,
      totalRevenue: Number(stats.find(s => s.status === 'COMPLETED')?._sum.amount || 0)
    };

    return createSuccessResponse({
      payments: transformedPayments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary
    });

  } catch (error) {
    console.error('Admin payments fetch error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}