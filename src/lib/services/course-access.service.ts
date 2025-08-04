// src/lib/services/course-access.service.ts

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface CourseAccessResult {
  hasAccess: boolean;
  reason:
    | 'enrolled'
    | 'free_course'
    | 'admin_access'
    | 'professor_owns'
    | 'payment_required'
    | 'not_published'
    | 'not_found'
    | 'not_authenticated';
  course?: {
    id: string;
    title: string;
    price: any;
    currency: string;
    isPublished: boolean;
    professorId: string;
  };
  enrollment?: {
    id: string;
    progressPercent: number;
    enrolledAt: Date;
  };
  payment?: {
    id: string;
    status: string;
    amount: any;
  };
}

/**
 * Checks if a user has access to a specific course. This is a read-only operation.
 */
export async function checkCourseAccess(
  courseId: string
): Promise<CourseAccessResult> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { hasAccess: false, reason: 'not_authenticated' };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        isPublished: true,
        professorId: true,
      },
    });

    if (!course) {
      return { hasAccess: false, reason: 'not_found' };
    }

    // Admins and course owners can access unpublished courses
    if (!course.isPublished && session.user.role !== 'ADMIN' && course.professorId !== session.user.id) {
        return { hasAccess: false, reason: 'not_published', course };
    }

    if (session.user.role === 'ADMIN') {
      return { hasAccess: true, reason: 'admin_access', course };
    }
    
    if (course.professorId === session.user.id) {
      return { hasAccess: true, reason: 'professor_owns', course };
    }

    // Check for enrollment for students
    if (session.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId } },
        select: { id: true, progressPercent: true, enrolledAt: true },
      });

      if (enrollment) {
        return { hasAccess: true, reason: 'enrolled', course, enrollment };
      }
    }
    
    // If not enrolled, check if the course is free
    if (!course.price || Number(course.price) <= 0) {
      return { hasAccess: true, reason: 'free_course', course };
    }

    // If it's a paid course and the student is not enrolled, they need to pay
    return { hasAccess: false, reason: 'payment_required', course };

  } catch (error) {
    console.error('Course access check error:', error);
    // Default to a secure state
    return { hasAccess: false, reason: 'not_found' };
  }
}

/**
 * Middleware-style function to protect routes by requiring course access.
 * Throws an error if the user does not have access.
 */
export async function requireCourseAccess(courseId: string): Promise<CourseAccessResult> {
  const accessResult = await checkCourseAccess(courseId);

  if (!accessResult.hasAccess) {
    // This error can be caught in API routes or server components to trigger a redirect or an error page.
    throw new Error(`Course access denied: ${accessResult.reason}`);
  }

  return accessResult;
}