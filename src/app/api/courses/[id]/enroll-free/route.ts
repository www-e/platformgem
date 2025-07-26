// src/app/api/courses/[id]/enroll-free/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { enrollInFreeCourse } from '@/lib/course-access';

interface RouteParams {
  params: { id: string }
}

// POST /api/courses/[id]/enroll-free - Enroll in free course
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = params;

    const result = await enrollInFreeCourse(courseId);

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