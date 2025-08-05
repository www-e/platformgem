// src/lib/services/course/index.service.ts

import { getCourseById } from './details.service';
import { getEnrolledCourses } from './student.service';
import { getFeaturedCourses, getCourseCatalog } from './public.service';

// Export a unified CourseService class for backward compatibility
export class CourseService {
  static async getCourseById(courseId: string, userId?: string, userRole?: any) {
    return getCourseById(courseId, userId, userRole);
  }

  static async getEnrolledCourses(userId: string) {
    return getEnrolledCourses(userId);
  }

  static async getFeaturedCourses(limit?: number) {
    return getFeaturedCourses(limit);
  }

  static async getCourseCatalog(filters: any, page?: number, limit?: number, sort?: string, userId?: string) {
    return getCourseCatalog(filters, page, limit, sort, userId);
  }
}

// Export individual functions as well
export { getCourseById, getEnrolledCourses, getFeaturedCourses, getCourseCatalog };