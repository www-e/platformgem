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
// R.A.K.A.N: FIX - Using proper Prisma type extraction with include syntax
export type User = Prisma.UserGetPayload<{ include: Record<string, never> }>;
export type Category = Prisma.CategoryGetPayload<{ include: Record<string, never> }>;
export type Course = Prisma.CourseGetPayload<{ include: Record<string, never> }>;
export type Lesson = Prisma.LessonGetPayload<{ include: Record<string, never> }>;
export type Enrollment = Prisma.EnrollmentGetPayload<{ include: Record<string, never> }>;
export type Certificate = Prisma.CertificateGetPayload<{ include: Record<string, never> }>;
export type Payment = Prisma.PaymentGetPayload<{ include: Record<string, never> }>;
export type ViewingHistory = Prisma.ViewingHistoryGetPayload<{ include: Record<string, never> }>;
export type ProgressMilestone = Prisma.ProgressMilestoneGetPayload<{ include: Record<string, never> }>;
export type PaymentWebhook = Prisma.PaymentWebhookGetPayload<{ include: Record<string, never> }>;

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

// --- ADDITIONAL UTILITY TYPES ---

/**
 * Course with professor and category relations
 */
export type CourseWithDetails = Prisma.CourseGetPayload<{
  include: {
    professor: true;
    category: true;
    lessons: true;
  };
}>;

/**
 * User with enrollments and courses
 */
export type UserWithEnrollments = Prisma.UserGetPayload<{
  include: {
    enrollments: {
      include: {
        course: true;
      };
    };
  };
}>;

/**
 * Lesson with course relation
 */
export type LessonWithCourse = Prisma.LessonGetPayload<{
  include: {
    course: true;
  };
}>;

/**
 * Material type for lesson materials JSON field
 */
export type LessonMaterial = {
  title: string;
  url: string;
  type?: string;
};

/**
 * Analytics data types
 */
export type AnalyticsData = {
  totalUsers: number;
  totalCourses: number;
  totalPayments: number;
  revenueData: Array<{ date: string; revenue: number }>;
  userGrowth: Array<{ date: string; users: number }>;
};

/**
 * Chart data point type
 */
export type ChartDataPoint = {
  date: string;
  value: number;
  label?: string;
};

/**
 * Generic function type for event handlers
 */
export type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/**
 * Payment action function type
 */
export type PaymentActionHandler = (id: string, data?: PaymentActionData) => void | Promise<void>;

/**
 * Enhanced EnrollmentWithHistory that includes professor relation
 */
export type EnrollmentWithCourseDetails = Prisma.EnrollmentGetPayload<{
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
        professor: true;
      };
    };
  };
}>;

/**
 * Material type with id for components that require it
 */
export type MaterialWithId = LessonMaterial & {
  id: string;
};

/**
 * Decimal conversion utility type
 */
export type DecimalValue = {
  toNumber(): number;
} | number;