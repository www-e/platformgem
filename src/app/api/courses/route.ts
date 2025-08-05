// src/app/api/courses/route.ts
// Public course catalog API with role-based data

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CourseFilters } from '@/types/course';
import { validateCourseFilters } from '@/lib/course-utils';
import { CourseService } from '@/lib/services/course/index.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await auth();
    
    // Parse and validate filters
    const rawFilters = {
      category: searchParams.get('category'),
      priceRange: searchParams.get('priceRange'),
      level: searchParams.get('level'),
      duration: searchParams.get('duration'),
      rating: searchParams.get('rating'),
      search: searchParams.get('search')
    };
    
    const filters: CourseFilters = validateCourseFilters(rawFilters);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(24, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const sort = searchParams.get('sort') || 'newest';

    // Get course catalog using service
    const response = await CourseService.getCourseCatalog(
      filters,
      page,
      limit,
      sort,
      session?.user?.id
    );

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=900'
      }
    });

  } catch (error) {
    console.error('Course catalog error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch courses',
        code: 'COURSE_CATALOG_ERROR'
      },
      { status: 500 }
    );
  }
}