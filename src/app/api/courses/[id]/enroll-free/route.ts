// src/app/api/courses/[id]/enroll-free/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { enrollInFreeCourse } from '@/lib/services/enrollment/core.service';

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST /api/courses/[id]/enroll-free - Enroll in free course
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      }, { status: 401 });
    }

    const { id: courseId } = await params;

    const result = await enrollInFreeCourse(courseId, session.user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        enrollmentId: result.enrollmentId
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Free enrollment API error:', error);
    return NextResponse.json({
      success: false,
      message: 'حدث خطأ أثناء التسجيل في الدورة'
    }, { status: 500 });
  }
}