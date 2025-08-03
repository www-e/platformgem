// src/app/api/admin/payments/[paymentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

// This is a placeholder for the full type definition we will build out
interface RouteParams {
  params: { paymentId: string }
}

// NOTE: This file will eventually handle GET, PATCH, DELETE, etc.
// For now, we are just moving the existing PATCH logic to fix the immediate error.

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
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
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return createErrorResponse(
        'INVALID_STATUS',
        'Invalid or missing payment status provided.',
        400
      );
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: status.toUpperCase(),
        failureReason: status.toUpperCase() === 'FAILED' ? reason : null,
        updatedAt: new Date()
      }
    });

    // We can add logic here later to handle enrollments if a payment
    // is manually marked as 'COMPLETED'.

    return createSuccessResponse({
      payment: {
        ...updatedPayment,
        amount: Number(updatedPayment.amount)
      },
      message: `Payment status updated to ${status}`
    });

  } catch (error) {
    console.error('Admin Payment PATCH error:', error);
    // Check for specific Prisma error for not found
    if ((error as any).code === 'P2025') {
       return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'Payment not found.',
        ApiErrors.NOT_FOUND.status
      );
    }
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}