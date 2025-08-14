// src/lib/api/database.ts
// Consolidated database utilities and transaction helpers

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { createErrorResponse, ApiErrors } from '@/lib/api-response';

/**
 * Execute database operation with error handling
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  errorContext: string = 'Database operation'
): Promise<T | ReturnType<typeof createErrorResponse>> {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorContext} error:`, error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002':
          return createErrorResponse(
            ApiErrors.DUPLICATE_ERROR.code,
            'البيانات موجودة بالفعل',
            ApiErrors.DUPLICATE_ERROR.status
          );
        case 'P2025':
          return createErrorResponse(
            ApiErrors.NOT_FOUND.code,
            'العنصر غير موجود',
            ApiErrors.NOT_FOUND.status
          );
        default:
          return createErrorResponse(
            ApiErrors.INTERNAL_ERROR.code,
            ApiErrors.INTERNAL_ERROR.message,
            ApiErrors.INTERNAL_ERROR.status,
            error
          );
      }
    }
    
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

/**
 * Execute transaction with error handling
 */
export async function executeTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  errorContext: string = 'Transaction'
): Promise<T | ReturnType<typeof createErrorResponse>> {
  return executeWithErrorHandling(
    () => prisma.$transaction(operation, { timeout: 30000 }),
    errorContext
  );
}

/**
 * Check if database result is an error
 */
export function isDatabaseError(result: any): result is ReturnType<typeof createErrorResponse> {
  return result && typeof result.json === 'function';
}

/**
 * Common database queries
 */
export const commonQueries = {
  /**
   * Check if user exists and has specific role
   */
  async checkUserExists(userId: string, role?: string) {
    return executeWithErrorHandling(
      () => prisma.user.findFirst({
        where: {
          id: userId,
          ...(role && { role: role as any })
        },
        select: {
          id: true,
          name: true,
          role: true,
          isActive: true
        }
      }),
      'Check user exists'
    );
  },

  /**
   * Check if course exists and is published
   */
  async checkCourseExists(courseId: string, requirePublished: boolean = false) {
    return executeWithErrorHandling(
      () => prisma.course.findFirst({
        where: {
          id: courseId,
          ...(requirePublished && { isPublished: true })
        },
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          isPublished: true,
          professorId: true
        }
      }),
      'Check course exists'
    );
  },

  /**
   * Check if enrollment exists
   */
  async checkEnrollmentExists(userId: string, courseId: string) {
    return executeWithErrorHandling(
      () => prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        },
        select: {
          id: true,
          progressPercent: true,
          enrolledAt: true
        }
      }),
      'Check enrollment exists'
    );
  },

  /**
   * Check if category exists
   */
  async checkCategoryExists(categoryId: string) {
    return executeWithErrorHandling(
      () => prisma.category.findUnique({
        where: { id: categoryId },
        select: {
          id: true,
          name: true,
          isActive: true
        }
      }),
      'Check category exists'
    );
  }
};