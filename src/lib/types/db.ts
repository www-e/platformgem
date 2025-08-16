// src/lib/types/db.ts
import { Prisma } from '@prisma/client';

/**
 * ======================================================================================
 * R.A.K.A.N's NOTE: This file is our single source of truth for database types.
 * This version uses a stricter `include: {}` syntax to avoid the "{}" empty object error
 * and provide better type inference.
 * ======================================================================================
 */

// --- BASE MODEL TYPES ---
// R.A.K.A.N: FIX - Replaced `{}` with `{ include: {} }` for stricter type safety.
export type User = Prisma.UserGetPayload<{ include: {} }>;
export type Category = Prisma.CategoryGetPayload<{ include: {} }>;
export type Course = Prisma.CourseGetPayload<{ include: {} }>;
export type Lesson = Prisma.LessonGetPayload<{ include: {} }>;
export type Enrollment = Prisma.EnrollmentGetPayload<{ include: {} }>;
export type Certificate = Prisma.CertificateGetPayload<{ include: {} }>;
export type Payment = Prisma.PaymentGetPayload<{ include: {} }>;
export type ViewingHistory = Prisma.ViewingHistoryGetPayload<{ include: {} }>;
export type ProgressMilestone = Prisma.ProgressMilestoneGetPayload<{ include: {} }>;

// --- TYPES WITH RELATIONS ---

/**
 * `Payment` with its related `user`, `course` (and nested `professor`), and the last `webhook`.
 */
export type PaymentWithDetails = Prisma.PaymentGetPayload<{
  include: {
    user: true;
    course: {
      include: {
        professor: true;
      };
    };
    webhooks: {
      orderBy: {
        createdAt: 'desc';
      };
      take: 1;
    };
  };
}>;

/**
 * `Enrollment` with full related data for analytics and processing.
 */
export type EnrollmentWithHistory = Prisma.EnrollmentGetPayload<{
  include: {
    user: {
      include: {
        viewingHistory: {
          include: {
            lesson: true;
          }
        };
      };
    };
    course: {
      include: {
        lessons: true;
      };
    };
  };
}>;

/**
 * `Certificate` with its related `course`.
 */
export type CertificateWithCourse = Prisma.CertificateGetPayload<{
  include: {
    course: true;
  };
}>;


// --- API & UTILITY TYPES ---

/**
 * A generic type for Prisma's JSON fields. Safer than using `any`.
 */
export type JsonObject = Prisma.JsonObject;

/**
 * A specific type for the `additionalData` parameter in the admin payment actions.
 */
export type PaymentActionData = {
  reason?: string;
};