// src/lib/api-utils.ts
import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(response, { status });
}

export function createErrorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      details: process.env.NODE_ENV === 'development' ? details : undefined
    },
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(response, { status });
}

export const ApiErrors = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'يجب تسجيل الدخول أولاً', status: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'غير مصرح لك بالوصول لهذا المورد', status: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'المورد غير موجود', status: 404 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'بيانات غير صحيحة', status: 400 },
  DUPLICATE_ERROR: { code: 'DUPLICATE_ERROR', message: 'البيانات موجودة بالفعل', status: 409 },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'حدث خطأ في الخادم', status: 500 }
};

export function handleApiError(error: any, context: string = 'API'): NextResponse {
  console.error(`${context} error:`, error);
  
  return createErrorResponse(
    ApiErrors.INTERNAL_ERROR.code,
    ApiErrors.INTERNAL_ERROR.message,
    ApiErrors.INTERNAL_ERROR.status,
    error
  );
}