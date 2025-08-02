// src/app/api/payments/[id]/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id } = params;

    // Find the payment with related data
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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
        }
      }
    });

    if (!payment) {
      return createErrorResponse(
        'PAYMENT_NOT_FOUND',
        'Payment not found',
        404
      );
    }

    // Check if user can access this payment
    const canAccess = session.user.role === 'ADMIN' || 
                     payment.userId === session.user.id ||
                     (session.user.role === 'PROFESSOR' && payment.course.professorId === session.user.id);

    if (!canAccess) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        'You do not have permission to view this payment',
        ApiErrors.UNAUTHORIZED.status
      );
    }

    // Transform payment to handle Decimal serialization
    const transformedPayment = {
      ...payment,
      amount: Number(payment.amount)
    };

    return createSuccessResponse(transformedPayment);

  } catch (error) {
    console.error('Payment details fetch error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}