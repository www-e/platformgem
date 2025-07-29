// src/lib/services/enrollment-service.ts
// Comprehensive enrollment service integrating payment and video access

import { UserRole } from '@prisma/client';
import prisma from '@/lib/prisma';
import { CourseWithMetadata } from '@/types/course';

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

export class EnrollmentService {
  /**
   * Check if user can access a course
   */
  static async checkCourseAccess(
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
            select: { lessons: true }
          }
        }
      });

      if (!course) {
        return {
          hasAccess: false,
          accessType: 'free',
          message: 'الدورة غير موجودة',
          canEnroll: false,
          requiresPayment: false
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
            requiresPayment: false
          };
        }

        return {
          hasAccess: false,
          accessType: 'free',
          message: 'الدورة غير متاحة حالياً',
          canEnroll: false,
          requiresPayment: false
        };
      }

      // Admin has full access
      if (userRole === 'ADMIN') {
        return {
          hasAccess: true,
          accessType: 'admin',
          message: 'وصول كامل كمدير',
          canEnroll: false,
          requiresPayment: false
        };
      }

      // Course owner has full access
      if (userId === course.professor.id) {
        return {
          hasAccess: true,
          accessType: 'owner',
          message: 'وصول كامل كمالك الدورة',
          canEnroll: false,
          requiresPayment: false
        };
      }

      // Check if user is enrolled
      if (userId) {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId,
              courseId
            }
          },
          include: {
            user: {
              include: {
                viewingHistory: {
                  where: {
                    lesson: {
                      courseId
                    }
                  }
                }
              }
            }
          }
        });

        if (enrollment) {
          // Calculate progress
          const totalLessons = course._count.lessons;
          const completedLessons = enrollment.user.viewingHistory.filter(vh => vh.completed).length;
          const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

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
              lastAccessedAt: enrollment.lastAccessedAt
            }
          };
        }
      }

      // Check if course is free
      const isFree = !course.price || course.price <= 0;
      
      if (isFree) {
        return {
          hasAccess: false,
          accessType: 'free',
          message: 'دورة مجانية - يمكن التسجيل',
          canEnroll: true,
          requiresPayment: false
        };
      }

      // Paid course - requires payment
      return {
        hasAccess: false,
        accessType: 'paid',
        message: `دورة مدفوعة - ${course.price} ${course.currency}`,
        canEnroll: true,
        requiresPayment: true
      };

    } catch (error) {
      console.error('Error checking course access:', error);
      return {
        hasAccess: false,
        accessType: 'free',
        message: 'حدث خطأ في التحقق من الوصول',
        canEnroll: false,
        requiresPayment: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enroll user in a free course
   */
  static async enrollInFreeCourse(
    courseId: string,
    userId: string
  ): Promise<EnrollmentResult> {
    try {
      // Check if course exists and is free
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return {
          success: false,
          message: 'الدورة غير موجودة'
        };
      }

      if (!course.isPublished) {
        return {
          success: false,
          message: 'الدورة غير متاحة حالياً'
        };
      }

      if (course.price && course.price > 0) {
        return {
          success: false,
          message: 'هذه الدورة مدفوعة وتتطلب دفع',
          requiresPayment: true
        };
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      });

      if (existingEnrollment) {
        return {
          success: false,
          message: 'أنت مسجل بالفعل في هذه الدورة',
          enrollmentId: existingEnrollment.id
        };
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date()
        }
      });

      return {
        success: true,
        message: 'تم التسجيل في الدورة بنجاح',
        enrollmentId: enrollment.id
      };

    } catch (error) {
      console.error('Error enrolling in free course:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء التسجيل',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create enrollment after successful payment
   */
  static async createPaidEnrollment(
    courseId: string,
    userId: string,
    paymentId: string
  ): Promise<EnrollmentResult> {
    try {
      // Verify payment exists and is completed
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { course: true }
      });

      if (!payment) {
        return {
          success: false,
          message: 'معلومات الدفع غير موجودة'
        };
      }

      if (payment.status !== 'COMPLETED') {
        return {
          success: false,
          message: 'الدفع لم يكتمل بعد'
        };
      }

      if (payment.courseId !== courseId || payment.userId !== userId) {
        return {
          success: false,
          message: 'بيانات الدفع غير متطابقة'
        };
      }

      // Check if already enrolled
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId
          }
        }
      });

      if (existingEnrollment) {
        return {
          success: true,
          message: 'أنت مسجل بالفعل في هذه الدورة',
          enrollmentId: existingEnrollment.id
        };
      }

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId,
          courseId,
          enrolledAt: new Date()
        }
      });

      return {
        success: true,
        message: 'تم التسجيل في الدورة بنجاح بعد الدفع',
        enrollmentId: enrollment.id
      };

    } catch (error) {
      console.error('Error creating paid enrollment:', error);
      return {
        success: false,
        message: 'حدث خطأ أثناء إنشاء التسجيل',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's enrollment status for multiple courses
   */
  static async getUserEnrollments(userId: string): Promise<{
    [courseId: string]: {
      enrollmentId: string;
      enrolledAt: Date;
      progress: number;
      lastAccessedAt: Date | null;
    }
  }> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            include: {
              _count: {
                select: { lessons: true }
              }
            }
          },
          user: {
            include: {
              viewingHistory: true
            }
          }
        }
      });

      const result: { [courseId: string]: any } = {};

      for (const enrollment of enrollments) {
        const totalLessons = enrollment.course._count.lessons;
        const courseViewingHistory = enrollment.user.viewingHistory.filter(vh => 
          // This would need to be joined properly with lessons table
          // For now, we'll use a simplified approach
          true
        );
        const completedLessons = courseViewingHistory.filter(vh => vh.completed).length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        result[enrollment.courseId] = {
          enrollmentId: enrollment.id,
          enrolledAt: enrollment.enrolledAt,
          progress,
          lastAccessedAt: enrollment.lastAccessedAt
        };
      }

      return result;

    } catch (error) {
      console.error('Error getting user enrollments:', error);
      return {};
    }
  }

  /**
   * Update enrollment progress
   */
  static async updateEnrollmentProgress(
    enrollmentId: string,
    progress: {
      completedLessonIds: string[];
      progressPercent: number;
      totalWatchTime: number;
      lastAccessedAt: Date;
    }
  ): Promise<boolean> {
    try {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          completedLessonIds: progress.completedLessonIds,
          progressPercent: progress.progressPercent,
          totalWatchTime: progress.totalWatchTime,
          lastAccessedAt: progress.lastAccessedAt,
          updatedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error updating enrollment progress:', error);
      return false;
    }
  }
}