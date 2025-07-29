// src/types/course.ts
// Comprehensive type definitions for course-related data

import { UserRole } from '@prisma/client';

// Base course interface
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number | null;
  currency: string;
  isPublished: boolean;
  bunnyLibraryId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Course with relationships
export interface CourseWithRelations extends Course {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  professor: {
    id: string;
    name: string;
    expertise: string[];
    bio?: string;
  };
  lessons: Lesson[];
}

// Course with computed metadata
export interface CourseWithMetadata extends CourseWithRelations {
  enrollmentCount: number;
  totalDuration: number; // in minutes
  lessonCount: number;
  averageRating: number;
  reviewCount: number;
  
  // User-specific data (when authenticated)
  isEnrolled?: boolean;
  progress?: number;
  lastAccessedAt?: Date;
  canEdit?: boolean;
  canManage?: boolean;
}

// Featured course for landing page
export interface FeaturedCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number | null;
  currency: string;
  professor: {
    name: string;
  };
  category: {
    name: string;
  };
  enrollmentCount: number;
  totalDuration: number;
  lessonCount: number;
}

// Lesson interface
export interface Lesson {
  id: string;
  title: string;
  order: number;
  bunnyVideoId: string;
  duration: number | null; // in seconds
  materials?: any; // JSON field
}

// Enrollment interface
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  progressPercent: number;
  totalWatchTime: number;
  lastAccessedAt: Date | null;
  enrolledAt: Date;
  updatedAt: Date;
}

// Course with enrollment data
export interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: {
    name: string;
  };
  professor: {
    name: string;
  };
  enrolledAt: Date;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalDuration: number; // in minutes
  watchedDuration: number; // in minutes
  lastAccessedAt: Date | null;
  nextLesson: {
    id: string;
    title: string;
    order: number;
  } | null;
  certificateEarned: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
}

// User actions for course cards
export interface CourseUserActions {
  canEnroll: boolean;
  canEdit: boolean;
  canManage: boolean;
  isOwner: boolean;
  isEnrolled: boolean;
}

// Course card props
export interface CourseCardProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userActions: CourseUserActions;
  onEnroll?: () => void;
  onContinue?: () => void;
  onEdit?: () => void;
  onManage?: () => void;
}

// Course catalog filters
export interface CourseFilters {
  category?: string;
  priceRange?: 'free' | 'paid' | 'all';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  duration?: 'short' | 'medium' | 'long' | 'all';
  rating?: number;
  search?: string;
}

// Course catalog response
export interface CourseCatalogResponse {
  courses: CourseWithMetadata[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API response types
export interface APIResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface FeaturedCoursesResponse {
  courses: FeaturedCourse[];
}

export interface EnrolledCoursesResponse {
  courses: EnrolledCourse[];
}

// Navigation types
export interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
}

export interface NavigationConfig {
  [key: string]: NavigationItem[];
}

// Course action types
export type CourseAction = 'enroll' | 'continue' | 'edit' | 'manage' | 'view';

export interface CourseActionConfig {
  action: CourseAction;
  label: string;
  variant: 'default' | 'outline' | 'secondary' | 'destructive';
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
  allowedRoles?: UserRole[];
}