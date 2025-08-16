// src/lib/services/course/index.service.ts

import { getCourseById } from './details.service';
import { getEnrolledCourses } from './student.service';
import { getFeaturedCourses, getCourseCatalog } from './public.service';
import { UserRole } from '@prisma/client';

// Export a unified CourseService class for backward compatibility
export class CourseService {
  static async getCourseById(courseId: string, userId?: string, userRole?: string) {
    return getCourseById(courseId, userId, userRole as UserRole | undefined);
}

  static async getEnrolledCourses(userId: string) {
    return getEnrolledCourses(userId);
  }

  static async getFeaturedCourses(limit?: number) {
    return getFeaturedCourses(limit);
  }

  static async getCourseCatalog(filters: Record<string, unknown>, page?: number, limit?: number, sort?: string, userId?: string) {
    return getCourseCatalog(filters, page, limit, sort, userId);
  }
  
}

// Export individual functions as well
export { getCourseById, getEnrolledCourses, getFeaturedCourses, getCourseCatalog };