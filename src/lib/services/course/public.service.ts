// src/lib/services/course/public.service.ts

import prisma from '@/lib/prisma';
import {
  CourseWithMetadata,
  FeaturedCourse,
  CourseFilters,
  CourseCatalogResponse,
} from '@/types/course';
import {
  calculateCourseDuration,
  buildCourseWhereClause,
  getCourseSortOrder,
  calculatePagination,
} from '@/lib/course-utils';

/**
 * Get featured courses for the landing page.
 * @param limit - The maximum number of courses to return.
 * @returns A promise that resolves to an array of featured courses.
 */
export async function getFeaturedCourses(
  limit: number = 3
): Promise<FeaturedCourse[]> {
  const courses = await prisma.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      category: { select: { name: true } },
      professor: { select: { name: true } },
      lessons: { select: { id: true, duration: true } }, // Select only what's needed for calculations
      _count: { select: { enrollments: true } },
    },
    orderBy: {
      enrollments: { _count: 'desc' },
    },
    take: limit,
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    // FIX: Added missing properties
    description: course.description,
    currency: course.currency,
    totalDuration: calculateCourseDuration(course.lessons),
    // END FIX
    thumbnailUrl: course.thumbnailUrl,
    price: course.price ? Number(course.price) : null,
    professor: { name: course.professor.name },
    category: { name: course.category.name },
    enrollmentCount: course._count.enrollments,
    lessonCount: course.lessons.length,
  }));
}

/**
 * Get the public course catalog with filtering, sorting, and pagination.
 * @param filters - The filter criteria.
 * @param page - The current page number.
 * @param limit - The number of items per page.
 * @param sort - The sorting order.
 * @param userId - Optional ID of the user to check enrollment status.
 * @returns A promise that resolves to a structured catalog response.
 */
export async function getCourseCatalog(
  filters: CourseFilters,
  page: number = 1,
  limit: number = 12,
  sort: string = 'newest',
  userId?: string
): Promise<CourseCatalogResponse> {
  let enrolledCourseIds: string[] = [];
  if (userId) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      select: { courseId: true },
    });
    enrolledCourseIds = enrollments.map((e) => e.courseId);
  }

  const whereClause = buildCourseWhereClause(filters, enrolledCourseIds);
  const totalCount = await prisma.course.count({ where: whereClause });
  const pagination = calculatePagination(totalCount, page, limit);

  const courses = await prisma.course.findMany({
    where: whereClause,
    include: {
      category: true,
      professor: true,
      // R.A.K.A.N: FIX - Changed from `select` to `true` to fetch the full Lesson objects,
      // satisfying the CourseWithMetadata type.
      lessons: true,
      _count: { select: { enrollments: true } },
    },
    orderBy: getCourseSortOrder(sort),
    skip: pagination.skip,
    take: pagination.take,
  });

  const coursesWithMetadata: CourseWithMetadata[] = courses.map((course) => {
    const averageRating = 4.0 + Math.random() * 1.0;
    const reviewCount = Math.floor(Math.random() * 50) + 5;

    return {
      ...course,
      price: course.price, // Keep as Decimal, will be converted in UI
      enrollmentCount: course._count.enrollments,
      totalDuration: calculateCourseDuration(course.lessons),
      lessonCount: course.lessons.length,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
      isEnrolled: enrolledCourseIds.includes(course.id),
    };
  });

  return {
    courses: coursesWithMetadata,
    totalCount,
    totalPages: pagination.totalPages,
    currentPage: page,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
  };
}