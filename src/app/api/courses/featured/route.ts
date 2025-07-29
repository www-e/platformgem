// src/app/api/courses/featured/route.ts
// API endpoint for featured courses on landing page

import { NextResponse } from 'next/server';
import { FeaturedCoursesResponse } from '@/types/course';
import { CourseService } from '@/lib/services/course-service';

export async function GET() {
  try {
    const featuredCourses = await CourseService.getFeaturedCourses(3);

    const response: FeaturedCoursesResponse = {
      courses: featuredCourses
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800'
      }
    });

  } catch (error) {
    console.error('Featured courses error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch featured courses',
        code: 'FEATURED_COURSES_ERROR'
      },
      { status: 500 }
    );
  }
}