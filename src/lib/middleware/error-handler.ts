// src/lib/middleware/error-handler.ts

import { NextRequest, NextResponse } from 'next/server';
import { API_ERROR_CODES, createErrorResponse } from '@/lib/api-response';

export class ApiError extends Error {
  public statusCode?: number;
  public code?: string;
  public details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Enhanced error handling middleware for API routes
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      // Type guard for ApiError
      if (error instanceof ApiError) {
        return createErrorResponse(
          error.code || API_ERROR_CODES.INTERNAL_ERROR,
          error.message,
          error.statusCode || 500,
          error.details
        );
      }

      // Type guard for regular Error
      if (error instanceof Error) {
        // Handle specific error types
        if (error.message.includes('PayMob')) {
          return createErrorResponse(
            API_ERROR_CODES.PAYMENT_GATEWAY_ERROR,
            'حدث خطأ في نظام الدفع. يرجى المحاولة مرة أخرى.',
            502,
            { originalError: error.message }
          );
        }

        if (error.message.includes('Prisma') || error.message.includes('database')) {
          return createErrorResponse(
            API_ERROR_CODES.DATABASE_ERROR,
            'حدث خطأ في قاعدة البيانات. يرجى المحاولة لاحقاً.',
            500,
            process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined
          );
        }

        if (error.message.includes('timeout')) {
          return createErrorResponse(
            API_ERROR_CODES.INTERNAL_ERROR,
            'انتهت مهلة معالجة الطلب. يرجى المحاولة مرة أخرى.',
            504,
            { timeout: true }
          );
        }
      }

      // Generic error fallback
      const errorMessage = error instanceof Error ? error.message : String(error);
      return createErrorResponse(
        API_ERROR_CODES.INTERNAL_ERROR,
        'حدث خطأ داخلي غير متوقع',
        500,
        process.env.NODE_ENV === 'development' ? { error: errorMessage } : undefined
      );
    }
  };
}

/**
 * Create a custom API error
 */
export function createApiError(
  message: string,
  code?: string,
  statusCode?: number,
  details?: any
): ApiError {
  return new ApiError(message, code, statusCode, details);
}

/**
 * Validation error helper
 */
export function createValidationError(message: string, issues?: any[]): ApiError {
  return createApiError(
    message,
    API_ERROR_CODES.VALIDATION_ERROR,
    400,
    { validationIssues: issues }
  );
}

/**
 * Payment error helper
 */
export function createPaymentError(message: string, details?: any): ApiError {
  return createApiError(
    message,
    API_ERROR_CODES.PAYMENT_GATEWAY_ERROR,
    502,
    details
  );
}

/**
 * Authentication error helper
 */
export function createAuthError(message?: string): ApiError {
  return createApiError(
    message || 'يجب تسجيل الدخول للوصول لهذه الخدمة',
    API_ERROR_CODES.UNAUTHORIZED,
    401
  );
}
