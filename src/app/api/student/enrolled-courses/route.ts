// src/app/api/student/enrolled-courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CourseService } from '@/lib/services/course/index.service';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const studentId = session.user.id;

    // Get enrolled courses using service
    const courses = await CourseService.getEnrolledCourses(studentId);

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('Enrolled courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}