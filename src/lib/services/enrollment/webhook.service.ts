// src/lib/services/enrollment/webhook.service.ts

import prisma from '@/lib/prisma';
import { EnrollmentResult } from './types';

/**
 * Automatically creates an enrollment from a successful payment.
 * Typically called by a payment webhook handler.
 * @param paymentId - The ID of the completed payment.
 * @returns A promise that resolves to an EnrollmentResult object.
 */
export async function createEnrollmentFromPayment(
  paymentId: string
): Promise<EnrollmentResult> {
  try {
    // Get payment details with course and user info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        message: 'Payment record not found',
        error: 'PAYMENT_NOT_FOUND',
      };
    }

    if (payment.status !== 'COMPLETED') {
      return {
        success: false,
        message: 'Payment not completed',
        error: 'PAYMENT_NOT_COMPLETED',
      };
    }

    if (!payment.course.isPublished) {
      return {
        success: false,
        message: 'Course is not published',
        error: 'COURSE_NOT_PUBLISHED',
      };
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      },
    });

    if (existingEnrollment) {
      console.log('Enrollment already exists for payment:', paymentId);
      return {
        success: true,
        message: 'User already enrolled',
        enrollmentId: existingEnrollment.id,
      };
    }

    // Create enrollment with transaction to ensure consistency
    const enrollment = await prisma.$transaction(async (tx) => {
      // Create the enrollment
      const newEnrollment = await tx.enrollment.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
          progressPercent: 0,
          completedLessonIds: [],
          totalWatchTime: 0,
          enrolledAt: new Date(),
          lastAccessedAt: null,
        },
      });

      // Create a progress milestone for course start
      await tx.progressMilestone.create({
        data: {
          userId: payment.userId,
          courseId: payment.courseId,
          milestoneType: 'COURSE_START',
          metadata: {
            paymentId: payment.id,
            enrollmentId: newEnrollment.id,
            courseName: payment.course.title,
            amount: Number(payment.amount),
          },
        },
      });

      return newEnrollment;
    });

    console.log('Automatic enrollment created:', {
      enrollmentId: enrollment.id,
      userId: payment.userId,
      courseId: payment.courseId,
      paymentId: payment.id,
    });

    return {
      success: true,
      message: 'تم التسجيل في الدورة تلقائياً بعد الدفع',
      enrollmentId: enrollment.id,
    };
  } catch (error) {
    console.error('Error creating automatic enrollment:', error);
    // If an error occurs, we should handle it to allow for retries
    await handleEnrollmentFailure(
      paymentId,
      error instanceof Error ? error.message : 'Unknown transaction error'
    );
    return {
      success: false,
      message: 'Failed to create automatic enrollment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Logs an enrollment failure to the payment record for manual review and retry.
 * @param paymentId - The ID of the payment that failed to create an enrollment.
 * @param error - The error message.
 */
export async function handleEnrollmentFailure(
  paymentId: string,
  error: string
): Promise<void> {
  try {
    // Log the failure for manual review
    console.error(
      'Enrollment failure for payment:',
      paymentId,
      'Error:',
      error
    );

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    // Ensure paymobResponse is treated as an object
    const paymobResponse = (payment?.paymobResponse || {}) as any;

    // Update payment record to indicate enrollment failure
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymobResponse: {
          ...paymobResponse,
          enrollmentError: {
            error,
            timestamp: new Date().toISOString(),
            requiresManualReview: true,
          },
        },
      },
    });

    // TODO: Send notification to administrators
    // TODO: Queue for manual enrollment processing
  } catch (dbError) {
    console.error('Failed to log enrollment failure:', dbError);
  }
}

/**
 * Retries a failed enrollment creation process for a given payment.
 * @param paymentId - The ID of the payment to retry.
 * @returns A promise that resolves to an EnrollmentResult.
 */
export async function retryFailedEnrollment(
  paymentId: string
): Promise<EnrollmentResult> {
  try {
    console.log('Retrying failed enrollment for payment:', paymentId);

    const result = await createEnrollmentFromPayment(paymentId);

    if (result.success) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
      const paymobResponse = (payment?.paymobResponse || {}) as any;
      
      // Clear the enrollment error flag
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          paymobResponse: {
            ...paymobResponse,
            enrollmentError: null, // Clear the error
            enrollmentRetry: {
              retriedAt: new Date().toISOString(),
              success: true,
            },
          },
        },
      });
    }

    return result;
  } catch (error) {
    console.error('Error retrying enrollment:', error);
    return {
      success: false,
      message: 'Failed to retry enrollment',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}