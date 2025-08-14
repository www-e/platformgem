// src/app/api/certificates/generate/route.ts
import { NextRequest } from 'next/server';
import { generateCertificate, checkCertificateEligibility } from '@/lib/certificate';
import { z } from 'zod';
import { 
  createSuccessResponse,
  createErrorResponse,
  authenticateApiUser,
  isAuthError,
  validateRequestBody,
  isValidationError,
  withErrorHandling,
  ApiErrors
} from '@/lib/api';

const certificateRequestSchema = z.object({
  courseId: z.string().min(1, 'معرف الدورة مطلوب')
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authenticate user (any authenticated user can request certificates)
  const authResult = await authenticateApiUser();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Validate request body
  const validationResult = await validateRequestBody(request, certificateRequestSchema);
  if (isValidationError(validationResult)) {
    return validationResult;
  }

  const { courseId } = validationResult;

  // Check eligibility first
  const eligibility = await checkCertificateEligibility(authResult.user.id, courseId);
  
  if (!eligibility.eligible) {
    return createErrorResponse(
      'CERTIFICATE_NOT_ELIGIBLE',
      eligibility.reason || 'غير مؤهل للحصول على الشهادة',
      400,
      {
        completionRate: eligibility.completionRate,
        requiredRate: eligibility.requiredRate
      }
    );
  }

  // Generate certificate
  const result = await generateCertificate(authResult.user.id, courseId);

  if (!result.success) {
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      result.error || 'فشل في إنشاء الشهادة',
      ApiErrors.INTERNAL_ERROR.status
    );
  }

  return createSuccessResponse({
    certificate: result.certificate
  }, 'تم إنشاء الشهادة بنجاح', 201);
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authenticate user
  const authResult = await authenticateApiUser();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return createErrorResponse(
      ApiErrors.VALIDATION_ERROR.code,
      'معرف الدورة مطلوب',
      ApiErrors.VALIDATION_ERROR.status
    );
  }

  // Check eligibility
  const eligibility = await checkCertificateEligibility(authResult.user.id, courseId);

  return createSuccessResponse({
    eligible: eligibility.eligible,
    reason: eligibility.reason,
    completionRate: eligibility.completionRate,
    requiredRate: eligibility.requiredRate
  });
});