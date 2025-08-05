// src/lib/services/enrollment/core.service.ts

import prisma from '@/lib/prisma';
import { EnrollmentResult } from './types';
// Import webhook service functions
import { 
  createEnrollmentFromPayment as createEnrollmentFromPaymentWebhook,
  handleEnrollmentFailure as handleEnrollmentFailureWebhook
} from './webhook.service';

/**
 * Enroll a user in a free course.
 * @param courseId - The ID of the free course.
 * @param userId - The ID of the user to enroll.
 * @returns A promise that resolves to an EnrollmentResult object.
 */
export async function enrollInFreeCourse(
  courseId: string,
  userId: string
): Promise<EnrollmentResult> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'STUDENT') {
      return { success: false, message: 'غير مصرح لك بالتسجيل في الدورات' };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { isPublished: true, price: true, professorId: true },
    });

    if (!course) {
      return { success: false, message: 'الدورة غير موجودة' };
    }
    if (!course.isPublished) {
      return { success: false, message: 'الدورة غير متاحة حالياً' };
    }
    if (course.professorId === userId) {
      return { success: false, message: 'لا يمكنك التسجيل في دورتك الخاصة' };
    }
    if (course.price && Number(course.price) > 0) {
      return {
        success: false,
        message: 'هذه الدورة مدفوعة وتتطلب دفع',
        requiresPayment: true,
      };
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (existingEnrollment) {
      return {
        success: false,
        message: 'أنت مسجل بالفعل في هذه الدورة',
        enrollmentId: existingEnrollment.id,
      };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date(),
        progressPercent: 0,
        completedLessonIds: [],
        totalWatchTime: 0,
      },
    });

    return {
      success: true,
      message: 'تم التسجيل في الدورة بنجاح',
      enrollmentId: enrollment.id,
    };
  } catch (error) {
    console.error('Error enrolling in free course:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء التسجيل',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create an enrollment record after a successful payment has been verified.
 * @param courseId - The ID of the course.
 * @param userId - The ID of the user.
 * @param paymentId - The ID of the completed payment record.
 * @returns A promise that resolves to an EnrollmentResult object.
 */
export async function createPaidEnrollment(
  courseId: string,
  userId: string,
  paymentId: string
): Promise<EnrollmentResult> {
  try {
    // Verify payment exists and is completed
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { course: true },
    });

    if (!payment) {
      return {
        success: false,
        message: 'معلومات الدفع غير موجودة',
      };
    }

    if (payment.status !== 'COMPLETED') {
      return {
        success: false,
        message: 'الدفع لم يكتمل بعد',
      };
    }

    if (payment.courseId !== courseId || payment.userId !== userId) {
      return {
        success: false,
        message: 'بيانات الدفع غير متطابقة',
      };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return {
        success: true,
        message: 'أنت مسجل بالفعل في هذه الدورة',
        enrollmentId: existingEnrollment.id,
      };
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        enrolledAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'تم التسجيل في الدورة بنجاح بعد الدفع',
      enrollmentId: enrollment.id,
    };
  } catch (error) {
    console.error('Error creating paid enrollment:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء إنشاء التسجيل',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Export a service class for backward compatibility
export class EnrollmentService {
  static async enrollInFreeCourse(courseId: string, userId: string) {
    return enrollInFreeCourse(courseId, userId);
  }

  static async createPaidEnrollment(courseId: string, userId: string, paymentId: string) {
    return createPaidEnrollment(courseId, userId, paymentId);
  }

  static async checkCourseAccess(courseId: string, userId?: string, userRole?: any) {
    // Import and use the access service
    const { checkCourseAccess } = await import('../enrollment/access.service');
    return checkCourseAccess(courseId, userId, userRole);
  }

  static async createEnrollmentFromPayment(paymentData: {
    courseId: string;
    userId: string;
    paymentId: string;
  }) {
    return createEnrollmentFromPaymentWebhook(paymentData.paymentId);
  }

  static async handleEnrollmentFailure(paymentId: string, reason: string) {
    await handleEnrollmentFailureWebhook(paymentId, reason);
    return {
      success: false,
      message: `فشل في إنشاء التسجيل: ${reason}`,
    };
  }
}