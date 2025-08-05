// src/app/api/courses/[id]/enroll-enhanced/route.ts
// Enhanced enrollment API with payment integration

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { EnrollmentService } from '@/lib/services/enrollment/core.service';
import { z } from 'zod';

const enrollmentSchema = z.object({
  paymentId: z.string().optional(), // For paid courses
  enrollmentType: z.enum(['free', 'paid']).default('free')
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'التسجيل متاح للطلاب فقط', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const courseId = params.id;
    const body = await request.json();
    const { paymentId, enrollmentType } = enrollmentSchema.parse(body);

    // Check course access first
    const accessResult = await EnrollmentService.checkCourseAccess(
      courseId,
      session.user.id,
      session.user.role
    );

    if (accessResult.hasAccess) {
      return NextResponse.json({
        success: true,
        message: 'أنت مسجل بالفعل في هذه الدورة',
        enrollment: accessResult.enrollment
      });
    }

    if (!accessResult.canEnroll) {
      return NextResponse.json(
        { 
          error: accessResult.message,
          code: 'CANNOT_ENROLL'
        },
        { status: 400 }
      );
    }

    let enrollmentResult;

    if (enrollmentType === 'free' || !accessResult.requiresPayment) {
      // Free enrollment
      enrollmentResult = await EnrollmentService.enrollInFreeCourse(
        courseId,
        session.user.id
      );
    } else if (enrollmentType === 'paid' && paymentId) {
      // Paid enrollment - verify payment first
      enrollmentResult = await EnrollmentService.createPaidEnrollment(
        courseId,
        session.user.id,
        paymentId
      );
    } else {
      return NextResponse.json(
        { 
          error: 'هذه الدورة مدفوعة وتتطلب إتمام الدفع أولاً',
          code: 'PAYMENT_REQUIRED',
          requiresPayment: true
        },
        { status: 402 }
      );
    }

    if (!enrollmentResult.success) {
      return NextResponse.json(
        { 
          error: enrollmentResult.message,
          code: 'ENROLLMENT_FAILED',
          requiresPayment: enrollmentResult.requiresPayment
        },
        { status: 400 }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: enrollmentResult.message,
      enrollmentId: enrollmentResult.enrollmentId,
      redirectTo: `/courses/${courseId}` // Redirect to course content
    });

  } catch (error) {
    console.error('Enhanced enrollment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'بيانات غير صحيحة',
          code: 'VALIDATION_ERROR',
          details: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء التسجيل',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check enrollment status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    const courseId = params.id;

    // Check course access
    const accessResult = await EnrollmentService.checkCourseAccess(
      courseId,
      session?.user?.id,
      session?.user?.role
    );

    return NextResponse.json({
      courseId,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      access: accessResult
    });

  } catch (error) {
    console.error('Access check error:', error);
    return NextResponse.json(
      { 
        error: 'حدث خطأ في التحقق من الوصول',
        code: 'ACCESS_CHECK_ERROR'
      },
      { status: 500 }
    );
  }
}