// src/app/api/student/payments/route.ts
import { NextRequest} from 'next/server';
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id
    };
    
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get payments with course information
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where,
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

    // Transform payments to handle Decimal serialization
    const transformedPayments = payments.map(payment => ({
      ...payment,
      amount: Number(payment.amount)
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return createSuccessResponse({
      payments: transformedPayments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Student payments fetch error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}