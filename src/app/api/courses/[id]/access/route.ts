// src/app/api/courses/[id]/access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkCourseAccess } from '@/lib/course-access';

interface RouteParams {
  params: { id: string }
}

// GET /api/courses/[id]/access - Check course access
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = await params;

    const accessResult = await checkCourseAccess(courseId);

    return NextResponse.json(accessResult);

  } catch (error) {
    console.error('Course access API error:', error);
    return NextResponse.json({
      hasAccess: false,
      reason: 'not_found'
    }, { status: 500 });
  }
}