// src/lib/api-response.ts
// Unified API response system to eliminate duplication

import { NextResponse } from 'next/server';

/**
 * Unified API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any,
  requestId?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    timestamp: new Date().toISOString(),
    requestId
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Comprehensive error codes for all API operations
 */
export const API_ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Payment Specific
  PAYMENT_GATEWAY_ERROR: 'PAYMENT_GATEWAY_ERROR',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  PAYMENT_ALREADY_PROCESSED: 'PAYMENT_ALREADY_PROCESSED',
  PAYMENT_EXPIRED: 'PAYMENT_EXPIRED',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',

  // Webhook Specific
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_PAYLOAD_INVALID: 'WEBHOOK_PAYLOAD_INVALID',
  WEBHOOK_ALREADY_PROCESSED: 'WEBHOOK_ALREADY_PROCESSED',

  // Course & Enrollment
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  COURSE_NOT_PUBLISHED: 'COURSE_NOT_PUBLISHED',
  ALREADY_ENROLLED: 'ALREADY_ENROLLED',
  ENROLLMENT_FAILED: 'ENROLLMENT_FAILED',
  ENROLLMENT_NOT_ALLOWED: 'ENROLLMENT_NOT_ALLOWED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR'
} as const;

/**
 * User-friendly Arabic error messages
 */
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  [API_ERROR_CODES.UNAUTHORIZED]: 'يجب تسجيل الدخول للوصول لهذه الخدمة',
  [API_ERROR_CODES.FORBIDDEN]: 'غير مصرح لك بالوصول لهذه الخدمة',
  [API_ERROR_CODES.INVALID_TOKEN]: 'الرمز المميز غير صحيح',

  // Validation
  [API_ERROR_CODES.VALIDATION_ERROR]: 'البيانات المُدخلة غير صحيحة',
  [API_ERROR_CODES.INVALID_PAYLOAD]: 'البيانات المرسلة غير صحيحة',
  [API_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'بيانات مطلوبة مفقودة',

  // Payment Specific
  [API_ERROR_CODES.PAYMENT_GATEWAY_ERROR]: 'حدث خطأ في نظام الدفع. يرجى المحاولة مرة أخرى',
  [API_ERROR_CODES.PAYMENT_NOT_FOUND]: 'عملية الدفع غير موجودة',
  [API_ERROR_CODES.PAYMENT_ALREADY_PROCESSED]: 'عملية الدفع تمت معالجتها مسبقاً',
  [API_ERROR_CODES.PAYMENT_EXPIRED]: 'انتهت صلاحية عملية الدفع',
  [API_ERROR_CODES.INVALID_PAYMENT_METHOD]: 'طريقة الدفع غير صحيحة',
  [API_ERROR_CODES.INSUFFICIENT_FUNDS]: 'الرصيد غير كافي',
  [API_ERROR_CODES.DUPLICATE_TRANSACTION]: 'عملية الدفع تمت معالجتها مسبقاً',

  // Webhook Specific
  [API_ERROR_CODES.WEBHOOK_SIGNATURE_INVALID]: 'توقيع الويب هوك غير صحيح',
  [API_ERROR_CODES.WEBHOOK_PAYLOAD_INVALID]: 'بيانات الويب هوك غير صحيحة',
  [API_ERROR_CODES.WEBHOOK_ALREADY_PROCESSED]: 'الويب هوك تم معالجته مسبقاً',

  // Course & Enrollment
  [API_ERROR_CODES.COURSE_NOT_FOUND]: 'الدورة غير موجودة',
  [API_ERROR_CODES.COURSE_NOT_PUBLISHED]: 'الدورة غير منشورة',
  [API_ERROR_CODES.ALREADY_ENROLLED]: 'أنت مسجل في هذه الدورة بالفعل',
  [API_ERROR_CODES.ENROLLMENT_FAILED]: 'فشل في التسجيل بالدورة',
  [API_ERROR_CODES.ENROLLMENT_NOT_ALLOWED]: 'التسجيل غير مسموح',
  [API_ERROR_CODES.PAYMENT_REQUIRED]: 'هذه الدورة مدفوعة. يجب إتمام الدفع أولاً',

  // Database
  [API_ERROR_CODES.DATABASE_ERROR]: 'حدث خطأ في قاعدة البيانات',
  [API_ERROR_CODES.TRANSACTION_FAILED]: 'فشلت العملية',

  // General
  [API_ERROR_CODES.INTERNAL_ERROR]: 'حدث خطأ داخلي. يرجى المحاولة لاحقاً',
  [API_ERROR_CODES.NOT_FOUND]: 'العنصر غير موجود',
  [API_ERROR_CODES.RATE_LIMITED]: 'تم تجاوز الحد المسموح من الطلبات',
  [API_ERROR_CODES.MAINTENANCE_MODE]: 'الموقع في وضع الصيانة حالياً',
  [API_ERROR_CODES.DUPLICATE_ERROR]: 'البيانات موجودة بالفعل'
} as const;

/**
 * Get user-friendly message for error code
 */
export function getErrorMessage(code: keyof typeof API_ERROR_CODES): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Handle API errors with consistent formatting
 */
export function handleApiError(error: any, context: string = 'API'): NextResponse {
  console.error(`${context} error:`, error);
  
  return createErrorResponse(
    API_ERROR_CODES.INTERNAL_ERROR,
    ERROR_MESSAGES.INTERNAL_ERROR,
    500,
    error
  );
}

/**
 * Predefined error responses for common scenarios
 */
export const ApiErrors = {
  UNAUTHORIZED: { 
    code: API_ERROR_CODES.UNAUTHORIZED, 
    message: ERROR_MESSAGES.UNAUTHORIZED, 
    status: 401,
    create: () => createErrorResponse(API_ERROR_CODES.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED, 401)
  },
  FORBIDDEN: { 
    code: API_ERROR_CODES.FORBIDDEN, 
    message: ERROR_MESSAGES.FORBIDDEN, 
    status: 403,
    create: () => createErrorResponse(API_ERROR_CODES.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN, 403)
  },
  NOT_FOUND: { 
    code: API_ERROR_CODES.NOT_FOUND, 
    message: ERROR_MESSAGES.NOT_FOUND, 
    status: 404,
    create: () => createErrorResponse(API_ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, 404)
  },
  VALIDATION_ERROR: { 
    code: API_ERROR_CODES.VALIDATION_ERROR, 
    message: ERROR_MESSAGES.VALIDATION_ERROR, 
    status: 400,
    create: (details?: any) => createErrorResponse(API_ERROR_CODES.VALIDATION_ERROR, ERROR_MESSAGES.VALIDATION_ERROR, 400, details)
  },
  DUPLICATE_ERROR: { 
    code: API_ERROR_CODES.DUPLICATE_ERROR, 
    message: ERROR_MESSAGES.DUPLICATE_ERROR, 
    status: 409,
    create: () => createErrorResponse(API_ERROR_CODES.DUPLICATE_ERROR, ERROR_MESSAGES.DUPLICATE_ERROR, 409)
  },
  INTERNAL_ERROR: { 
    code: API_ERROR_CODES.INTERNAL_ERROR, 
    message: ERROR_MESSAGES.INTERNAL_ERROR, 
    status: 500,
    create: (details?: any) => createErrorResponse(API_ERROR_CODES.INTERNAL_ERROR, ERROR_MESSAGES.INTERNAL_ERROR, 500, details)
  }
};