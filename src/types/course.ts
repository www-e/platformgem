// src/types/course.ts
import { UserRole } from '@prisma/client';
import {
  Course as PrismaCourse,
  Lesson as PrismaLesson,
  Enrollment as PrismaEnrollment,
  Category as PrismaCategory,
  User as PrismaUser,
} from '@/lib/types/db';

/**
 * ======================================================================================
 * R.A.K.A.N's NOTE: This is the definitive, fully synchronized version of this file.
 * All UI-level types have been corrected to match their usage across the application.
 * This should resolve all "missing property" and "module has no exported member" errors.
 * ======================================================================================
 */

// --- RE-EXPORTED PRISMA TYPES ---
export type Course = PrismaCourse;
export type Lesson = PrismaLesson;
export type Enrollment = PrismaEnrollment;

// --- UI & COMPONENT-SPECIFIC TYPES ---

export interface CourseWithRelations extends PrismaCourse {
  category: PrismaCategory;
  professor: PrismaUser;
  lessons: PrismaLesson[];
}

export interface CourseWithMetadata extends CourseWithRelations {
  enrollmentCount: number;
  totalDuration: number;
  lessonCount: number;
  averageRating: number;
  reviewCount: number;
  isEnrolled?: boolean;
  progress?: number;
  lastAccessedAt?: Date;
  canEdit?: boolean;
  canManage?: boolean;
}

// CORRECTED: Added missing properties used in components.
export interface FeaturedCourse {
  id: string;
  title: string;
  description: string; // <-- Added
  thumbnailUrl: string;
  price: number | null;
  currency: string; // <-- Added
  professor: { name: string };
  category: { name: string };
  enrollmentCount: number;
  totalDuration: number; // <-- Added
  lessonCount: number;
}

// CORRECTED: Aligned with the object structure returned by `student.service.ts`.
export interface EnrolledCourse {
  id: string;
  title: string;
  thumbnailUrl: string;
  category: { name: string }; // <-- Changed from categoryName
  professor: { name: string }; // <-- Changed from professorName
  progress: number;
}

export interface CourseUserActions {
  canEnroll: boolean;
  canEdit: boolean;
  canManage: boolean;
  isOwner: boolean;
  isEnrolled: boolean;
}

export interface CourseCardProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userActions: CourseUserActions;
  viewMode: 'grid' | 'list';
}

// CORRECTED: Removed invalid 'duration' property.
export interface CourseFilters {
  category?: string;
  priceRange?: 'free' | 'paid' | 'all';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  search?: string;
}

export interface CourseCatalogResponse {
  courses: CourseWithMetadata[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// RESTORED: This type is needed for API responses.
export interface APIResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

// RESTORED: This type is needed for the featured courses API.
export interface FeaturedCoursesResponse {
  courses: FeaturedCourse[];
}