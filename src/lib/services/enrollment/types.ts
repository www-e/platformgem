// src/lib/services/enrollment/types.ts

// Re-export unified types to maintain backward compatibility
export type { CourseAccessResult } from '@/lib/types/course-access';

export interface EnrollmentResult {
  success: boolean;
  message: string;
  enrollmentId?: string;
  requiresPayment?: boolean;
  paymentUrl?: string;
  error?: string;
}