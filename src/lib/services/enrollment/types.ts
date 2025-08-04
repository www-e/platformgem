// src/lib/services/enrollment/types.ts

import { UserRole } from '@prisma/client';

export interface EnrollmentResult {
  success: boolean;
  message: string;
  enrollmentId?: string;
  requiresPayment?: boolean;
  paymentUrl?: string;
  error?: string;
}

export interface CourseAccessResult {
  hasAccess: boolean;
  accessType: 'free' | 'paid' | 'enrolled' | 'owner' | 'admin';
  message: string;
  canEnroll: boolean;
  requiresPayment: boolean;
  enrollment?: {
    id: string;
    enrolledAt: Date;
    progress: number;
    lastAccessedAt: Date | null;
  };
}