// src/app/api/student/recommended-courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category') || 'all';
    const priceRangeFilter = searchParams.get('priceRange') || 'all';
    const levelFilter = searchParams.get('level') || 'all';
    const durationFilter = searchParams.get('duration') || 'all';
    const ratingFilter = searchParams.get('rating') || 'all';

    const studentId = session.user.id;

    // Get student's enrolled courses to exclude them
    const enrolledCourses = await prisma.enrollment.findMany({
      where: { userId: studentId },
      select: { courseId: true }
    });
    const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

    // Get student's categories of interest (based on enrolled courses)
    const studentCategories = await prisma.course.findMany({
      where: { 
        id: { in: enrolledCourseIds }
      },
      select: { categoryId: true },
      distinct: ['categoryId']
    });
    const studentCategoryIds = studentCategories.map(c => c.categoryId);

    // Build where clause for filtering
    const whereClause: any = {
      isPublished: true,
      id: { notIn: enrolledCourseIds } // Exclude already enrolled courses
    };

    if (categoryFilter !== 'all') {
      whereClause.categoryId = categoryFilter;
    }

    // Get recommended courses
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        category: true,
        professor: true,
        lessons: true,
        enrollments: true,
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    // Transform courses data with recommendation logic
    const recommendedCourses = courses.map(course => {
      // Determine recommendation reason
      let recommendationReason: 'category_match' | 'similar_students' | 'trending' | 'professor_match' | 'completion_based' = 'trending';
      let recommendationScore = 50; // Base score

      if (studentCategoryIds.includes(course.categoryId)) {
        recommendationReason = 'category_match';
        recommendationScore += 30;
      }

      // Mock additional data
      const rating = 4.0 + Math.random() * 1.0; // 4.0-5.0
      const reviewCount = Math.floor(Math.random() * 100) + 10;
      const enrollmentCount = course._count.enrollments;
      const duration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) / 60; // in minutes
      const level = ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)] as 'beginner' | 'intermediate' | 'advanced';
      
      // Mock tags based on category
      const tags = [
        course.category.name,
        level === 'beginner' ? 'للمبتدئين' : level === 'intermediate' ? 'متوسط' : 'متقدم',
        'عملي',
        'شامل'
      ];

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        price: course.price ? Number(course.price) : 0,
        currency: course.currency,
        rating: Math.round(rating * 10) / 10,
        reviewCount,
        enrollmentCount,
        duration: Math.round(duration),
        level,
        category: {
          id: course.category.id,
          name: course.category.name,
          slug: course.category.slug
        },
        professor: {
          id: course.professor.id,
          name: course.professor.name,
          expertise: course.professor.expertise || []
        },
        lessons: course.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration || 0
        })),
        tags,
        recommendationReason,
        recommendationScore,
        isWishlisted: false // Mock - would check actual wishlist
      };
    });

    // Sort by recommendation score
    recommendedCourses.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return NextResponse.json({ courses: recommendedCourses });

  } catch (error) {
    console.error('Recommended courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended courses' },
      { status: 500 }
    );
  }
}