// src/lib/paymob/utils.ts

import { PayMobBillingData } from './types';

/**
 * Convert amount to cents (PayMob requires amounts in cents)
 */
export function formatAmountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Generate a unique merchant order ID
 */
export function generateMerchantOrderId(courseId: string, userId: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `course_${courseId}_${userId}_${timestamp}_${randomSuffix}`;
}

/**
 * Create standardized billing data for PayMob
 */
export function createBillingData(userData: {
  name: string;
  email?: string;
  phone?: string | null;
}): PayMobBillingData {
  const nameParts = userData.name.split(' ');
  const firstName = nameParts[0] || 'مستخدم';
  const lastName = nameParts.slice(1).join(' ') || 'غير محدد';

  return {
    first_name: firstName,
    last_name: lastName,
    email: userData.email || 'noemail@example.com',
    phone_number: userData.phone || '+201000000000',
    country: 'EG',
    state: 'Cairo',
    city: 'Cairo',
    street: 'N/A',
    building: 'N/A',
    floor: 'N/A',
    apartment: 'N/A',
  };
}

/**
 * Validate PayMob webhook HMAC fields
 */
export function validateHmacFields(data: any): boolean {
  const requiredFields = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
    'order',
    'owner',
    'pending',
    'success',
  ];

  return requiredFields.every(field => field in data);
}

/**
 * Format PayMob error messages for user display
 */
export function formatPayMobError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Common PayMob error patterns
    if (error.message.includes('timeout')) {
      return 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.';
    }
    if (error.message.includes('network') || error.message.includes('connection')) {
      return 'مشكلة في الاتصال. تأكد من اتصالك بالإنترنت.';
    }
    if (error.message.includes('invalid') && error.message.includes('key')) {
      return 'خطأ في إعدادات النظام. يرجى التواصل مع الدعم الفني.';
    }
    return error.message;
  }

  return 'حدث خطأ غير متوقع في نظام الدفع';
}

/**
 * Parse PayMob webhook timestamp
 */
export function parsePayMobTimestamp(timestamp: string): Date {
  try {
    return new Date(timestamp);
  } catch {
    return new Date();
  }
}

/**
 * Generate PayMob return URL with course context
 */
export function buildReturnUrl(baseUrl: string, courseId: string, success: boolean = true): string {
  const params = new URLSearchParams({
    course: courseId,
    status: success ? 'success' : 'failed',
    timestamp: Date.now().toString(),
  });

  return `${baseUrl}?${params.toString()}`;
}
