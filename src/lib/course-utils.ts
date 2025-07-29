// src/lib/course-utils.ts
// Utility functions for course-related operations

import { UserRole } from '@prisma/client';
import { CourseWithMetadata, CourseUserActions, CourseFilters } from '@/types/course';

/**
 * Calculate course duration in minutes from lessons
 */
export function calculateCourseDuration(lessons: { duration: number | null }[]): number {
  return Math.round(
    lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0) / 60
  );
}

/**
 * Calculate course progress percentage
 */
export function calculateCourseProgress(
  totalLessons: number,
  completedLessons: number
): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * Format course duration for display
 */
export function formatCourseDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقيقة`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ساعة`;
  }
  
  return `${hours} ساعة و ${remainingMinutes} دقيقة`;
}

/**
 * Format course price for display
 */
export function formatCoursePrice(price: number | null, currency: string = 'EGP'): string {
  if (price === null || price === 0) {
    return 'مجاني';
  }
  
  return `${price.toLocaleString('ar-EG')} ${currency}`;
}

/**
 * Determine user actions for a course based on role and enrollment status
 */
export function getCourseUserActions(
  course: CourseWithMetadata,
  userRole?: UserRole,
  userId?: string
): CourseUserActions {
  const isOwner = userId === course.professor.id;
  const isEnrolled = course.isEnrolled || false;
  
  return {
    canEnroll: !isEnrolled && userRole === 'STUDENT' && course.isPublished,
    canEdit: isOwner || userRole === 'ADMIN',
    canManage: userRole === 'ADMIN',
    isOwner,
    isEnrolled
  };
}

/**
 * Get course status based on progress
 */
export function getCourseStatus(progress: number): 'not_started' | 'in_progress' | 'completed' {
  if (progress === 0) return 'not_started';
  if (progress === 100) return 'completed';
  return 'in_progress';
}

/**
 * Build Prisma where clause for course filtering
 */
export function buildCourseWhereClause(
  filters: CourseFilters,
  excludeEnrolledCourses?: string[]
) {
  const where: any = {
    isPublished: true
  };

  // Exclude enrolled courses if provided
  if (excludeEnrolledCourses && excludeEnrolledCourses.length > 0) {
    where.id = { notIn: excludeEnrolledCourses };
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    where.categoryId = filters.category;
  }

  // Price filter
  if (filters.priceRange && filters.priceRange !== 'all') {
    if (filters.priceRange === 'free') {
      where.OR = [
        { price: null },
        { price: 0 }
      ];
    } else if (filters.priceRange === 'paid') {
      where.price = { gt: 0 };
    }
  }

  // Search filter
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      {
        professor: {
          name: { contains: filters.search, mode: 'insensitive' }
        }
      },
      {
        category: {
          name: { contains: filters.search, mode: 'insensitive' }
        }
      }
    ];
  }

  return where;
}

/**
 * Get course sort order based on sort parameter
 */
export function getCourseSortOrder(sort?: string) {
  switch (sort) {
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'oldest':
      return { createdAt: 'asc' as const };
    case 'title':
      return { title: 'asc' as const };
    case 'price_low':
      return { price: 'asc' as const };
    case 'price_high':
      return { price: 'desc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}

/**
 * Calculate pagination values
 */
export function calculatePagination(
  totalCount: number,
  page: number = 1,
  limit: number = 12
) {
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  const skip = (page - 1) * limit;

  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    skip,
    take: limit
  };
}

/**
 * Validate course filters
 */
export function validateCourseFilters(filters: any): CourseFilters {
  return {
    category: typeof filters.category === 'string' ? filters.category : undefined,
    priceRange: ['free', 'paid', 'all'].includes(filters.priceRange) 
      ? filters.priceRange 
      : 'all',
    level: ['beginner', 'intermediate', 'advanced', 'all'].includes(filters.level)
      ? filters.level
      : 'all',
    duration: ['short', 'medium', 'long', 'all'].includes(filters.duration)
      ? filters.duration
      : 'all',
    rating: typeof filters.rating === 'number' && filters.rating >= 1 && filters.rating <= 5
      ? filters.rating
      : undefined,
    search: typeof filters.search === 'string' && filters.search.length > 0
      ? filters.search.trim()
      : undefined
  };
}

/**
 * Generate course slug from title
 */
export function generateCourseSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Check if user can access course
 */
export function canUserAccessCourse(
  course: CourseWithMetadata,
  userRole?: UserRole,
  userId?: string
): boolean {
  // Public courses are accessible to everyone
  if (!course.isPublished) {
    // Unpublished courses only accessible to owner and admin
    return userId === course.professor.id || userRole === 'ADMIN';
  }

  return true;
}

/**
 * Get course difficulty level based on metadata
 */
export function getCourseDifficultyLevel(
  lessonCount: number,
  duration: number
): 'beginner' | 'intermediate' | 'advanced' {
  if (lessonCount <= 5 && duration <= 120) return 'beginner';
  if (lessonCount <= 15 && duration <= 480) return 'intermediate';
  return 'advanced';
}

/**
 * Calculate course completion time estimate
 */
export function estimateCompletionTime(totalDuration: number): string {
  const days = Math.ceil(totalDuration / 120); // Assuming 2 hours per day
  
  if (days === 1) return 'يوم واحد';
  if (days <= 7) return `${days} أيام`;
  if (days <= 30) return `${Math.ceil(days / 7)} أسابيع`;
  
  return `${Math.ceil(days / 30)} شهور`;
}