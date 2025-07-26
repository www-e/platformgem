// src/app/api/courses/[id]/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

interface RouteParams {
  params: { id: string }
}

// POST /api/courses/[id]/enroll - Enroll in course
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    // Only students can enroll (admins can enroll for testing)
    if (!['STUDENT', 'ADMIN'].includes(session.user.role)) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بالتسجيل في الدورات',
        ApiErrors.FORBIDDEN.status
      );
    }

    const { id: courseId } = params;

    // Check if course exists and is published
    const course = await prisma.course.findFirst({
      where: { 
        id: courseId, 
        isPublished: true 
      },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        professorId: true
      }
    });

    if (!course) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'الدورة غير موجودة أو غير منشورة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return createErrorResponse(
        ApiErrors.DUPLICATE_ERROR.code,
        'أنت مسجل في هذه الدورة بالفعل',
        ApiErrors.DUPLICATE_ERROR.status
      );
    }

    // Check if course is paid and requires payment
    if (course.price && Number(course.price) > 0) {
      // For paid courses, check if there's a completed payment
      const completedPayment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          courseId,
          status: 'COMPLETED'
        }
      });

      if (!completedPayment) {
        return createErrorResponse(
          'PAYMENT_REQUIRED',
          'هذه دورة مدفوعة. يجب إتمام الدفع أولاً.',
          402 // Payment Required
        );
      }
    }

    // Prevent professors from enrolling in their own courses
    if (course.professorId === session.user.id) {
      return createErrorResponse(
        'INVALID_ENROLLMENT',
        'لا يمكنك التسجيل في دورتك الخاصة',
        400
      );
    }

    // Create enrollment for free courses
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        progressPercent: 0,
        completedLessonIds: [],
        totalWatchTime: 0
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            professor: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return createSuccessResponse({
      enrollment,
      message: 'تم التسجيل في الدورة بنجاح!'
    }, 201);

  } catch (error) {
    console.error('Course enrollment error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// DELETE /api/courses/[id]/enroll - Unenroll from course
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id: courseId } = params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      },
      include: {
        course: {
          select: {
            title: true,
            price: true
          }
        }
      }
    });

    if (!enrollment) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'أنت غير مسجل في هذه الدورة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Prevent unenrollment from paid courses (business rule)
    if (enrollment.course.price && Number(enrollment.course.price) > 0) {
      return createErrorResponse(
        'PAID_COURSE_UNENROLL',
        'لا يمكن إلغاء التسجيل من الدورات المدفوعة. تواصل مع الدعم الفني.',
        400
      );
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    });

    return createSuccessResponse({
      message: 'تم إلغاء التسجيل من الدورة بنجاح'
    });

  } catch (error) {
    console.error('Course unenrollment error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}