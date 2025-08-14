// src/app/api/admin/payments/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse,
  authenticateAdmin,
  isAuthError,
  extractPaginationParams,
  extractSearchFilters,
  buildPaymentSearchWhere,
  withErrorHandling
} from '@/lib/api';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Extract pagination and filters
  const { page, limit, skip } = extractPaginationParams(request, 20);
  const filters = extractSearchFilters(request);

  // Build where clause
  const where = buildPaymentSearchWhere(filters);

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
});