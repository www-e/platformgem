// src/lib/api/validation.ts
// Consolidated validation utilities for API routes

import { z } from 'zod';
import { createErrorResponse, ApiErrors } from '@/lib/api-response';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  id: z.string().min(1, 'المعرف مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  name: z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
  description: z.string().min(1, 'الوصف مطلوب').max(1000, 'الوصف طويل جداً'),
  url: z.string().url('الرابط غير صحيح').optional().or(z.literal('')),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي صفر').optional(),
  currency: z.string().default('EGP'),
  boolean: z.boolean().default(false)
};

/**
 * Category validation schema
 */
export const categorySchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب').max(100, 'اسم الفئة طويل جداً'),
  description: z.string().min(1, 'وصف الفئة مطلوب').max(500, 'وصف الفئة طويل جداً'),
  iconUrl: commonSchemas.url,
  slug: z.string().min(1, 'الرابط المختصر مطلوب').max(50, 'الرابط المختصر طويل جداً')
    .regex(/^[a-z0-9-]+$/, 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط')
});

/**
 * Course validation schema
 */
export const courseSchema = z.object({
  title: commonSchemas.name,
  description: commonSchemas.description,
  categoryId: commonSchemas.id,
  professorId: commonSchemas.id,
  price: commonSchemas.price,
  currency: commonSchemas.currency,
  thumbnailUrl: z.string().min(1, 'رابط الصورة مطلوب'),
  bunnyLibraryId: z.string().min(1, 'معرف مكتبة Bunny مطلوب'),
  isPublished: commonSchemas.boolean
});

/**
 * Payment initiation validation schema
 */
export const paymentInitiateSchema = z.object({
  courseId: commonSchemas.id,
  paymentMethod: z.enum(['credit-card', 'e-wallet']).default('credit-card'),
  phoneNumber: z.string().optional()
});

/**
 * Validate request body against schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T | ReturnType<typeof createErrorResponse>> {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        ApiErrors.VALIDATION_ERROR.message,
        ApiErrors.VALIDATION_ERROR.status,
        validationResult.error.issues
      );
    }

    return validationResult.data;
  } catch (error) {
    return createErrorResponse(
      ApiErrors.VALIDATION_ERROR.code,
      'البيانات المرسلة غير صحيحة',
      ApiErrors.VALIDATION_ERROR.status
    );
  }
}

/**
 * Check if validation result is an error
 */
export function isValidationError(result: any): result is ReturnType<typeof createErrorResponse> {
  return result && typeof result.json === 'function';
}