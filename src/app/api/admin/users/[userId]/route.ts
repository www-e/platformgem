// src/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: { userId: string }
}

// PATCH /api/admin/users/[userId] - Update user status
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

    const { userId } = params;
    const body = await request.json();
    const { isActive } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'User not found',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Prevent admin from deactivating themselves
    if (userId === session.user.id) {
      return createErrorResponse(
        'CANNOT_MODIFY_SELF',
        'Cannot modify your own account status',
        400
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive }
    });

    return createSuccessResponse({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        isActive: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error('User update error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// DELETE /api/admin/users/[userId] - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'User not found',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return createErrorResponse(
        'CANNOT_DELETE_SELF',
        'Cannot delete your own account',
        400
      );
    }

    // Delete user and all related data
    await prisma.$transaction(async (tx) => {
      // Delete related data first
      await tx.paymentWebhook.deleteMany({
        where: {
          payment: {
            userId: userId
          }
        }
      });

      await tx.payment.deleteMany({
        where: { userId: userId }
      });

      await tx.enrollment.deleteMany({
        where: { userId: userId }
      });

      await tx.viewingHistory.deleteMany({
        where: { userId: userId }
      });

      await tx.certificate.deleteMany({
        where: { userId: userId }
      });

      await tx.progressMilestone.deleteMany({
        where: { userId: userId }
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    return createSuccessResponse({
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('User deletion error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}