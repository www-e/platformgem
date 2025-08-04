// src/lib/services/enrollment/access.service.ts

import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CourseAccessResult } from './types';

/**
 * Check if a user can access a course and determine their access level.
 * @param courseId - The ID of the course.
 * @param userId - The ID of the user (optional).
 * @param userRole - The role of the user (optional).
 * @returns A promise that resolves to a CourseAccessResult object.
 */
export async function checkCourseAccess(
  courseId: string,
  userId?: string,
  userRole?: UserRole
): Promise<CourseAccessResult> {
  try {
    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        professor: true,
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!course) {
      return {
        hasAccess: false,
        accessType: 'free',
        message: 'الدورة غير موجودة',
        canEnroll: false,
        requiresPayment: false,
      };
    }

    // Check if course is published
    if (!course.isPublished) {
      // Only owner and admin can access unpublished courses
      if (userId === course.professor.id || userRole === 'ADMIN') {
        return {
          hasAccess: true,
          accessType: userRole === 'ADMIN' ? 'admin' : 'owner',
          message: 'وصول كامل كمالك/مدير',
          canEnroll: false,
          requiresPayment: false,
        };
      }

      return {
        hasAccess: false,
        accessType: 'free',
        message: 'الدورة غير متاحة حالياً',
        canEnroll: false,
        requiresPayment: false,
      };
    }

    // Admin has full access
    if (userRole === 'ADMIN') {
      return {
        hasAccess: true,
        accessType: 'admin',
        message: 'وصول كامل كمدير',
        canEnroll: false,
        requiresPayment: false,
      };
    }

    // Course owner has full access
    if (userId === course.professor.id) {
      return {
        hasAccess: true,
        accessType: 'owner',
        message: 'وصول كامل كمالك الدورة',
        canEnroll: false,
        requiresPayment: false,
      };
    }

    // Check if user is enrolled
    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        include: {
          user: {
            include: {
              viewingHistory: {
                where: {
                  lesson: {
                    courseId,
                  },
                },
              },
            },
          },
        },
      });

      if (enrollment) {
        // Calculate progress
        const totalLessons = course._count.lessons;
        const completedLessons = enrollment.user.viewingHistory.filter(
          (vh) => vh.completed
        ).length;
        const progress =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          hasAccess: true,
          accessType: 'enrolled',
          message: 'مسجل في الدورة',
          canEnroll: false,
          requiresPayment: false,
          enrollment: {
            id: enrollment.id,
            enrolledAt: enrollment.enrolledAt,
            progress,
            lastAccessedAt: enrollment.lastAccessedAt,
          },
        };
      }
    }

    // Check if course is free
    const isFree = !course.price || Number(course.price) <= 0;

    if (isFree) {
      return {
        hasAccess: false,
        accessType: 'free',
        message: 'دورة مجانية - يمكن التسجيل',
        canEnroll: true,
        requiresPayment: false,
      };
    }

    // Paid course - requires payment
    return {
      hasAccess: false,
      accessType: 'paid',
      message: `دورة مدفوعة - ${course.price} ${course.currency}`,
      canEnroll: true,
      requiresPayment: true,
    };
  } catch (error) {
    console.error('Error checking course access:', error);
    return {
      hasAccess: false,
      accessType: 'free',
      message: 'حدث خطأ في التحقق من الوصول',
      canEnroll: false,
      requiresPayment: false,
    };
  }
}