// src/lib/services/course-service.ts
// Backward compatibility layer for the old course service

export { getFeaturedCourses, getCourseCatalog } from './course/public.service';
export { getCourseById as getCourseDetails } from './course/details.service';
export { getEnrolledCourses as getStudentCourses } from './course/student.service';

// Re-export all course-related functions for backward compatibility
export * from './course/public.service';
export * from './course/details.service';
export * from './course/student.service';

// Export a CourseService class for backward compatibility
export class CourseService {
  static async getFeaturedCourses(limit?: number) {
    const { getFeaturedCourses } = await import('./course/public.service');
    return getFeaturedCourses(limit);
  }

  static async getCourseCatalog(filters: any, page?: number, limit?: number, sort?: string, userId?: string) {
    const { getCourseCatalog } = await import('./course/public.service');
    return getCourseCatalog(filters, page, limit, sort, userId);
  }

  static async getCourseDetails(courseId: string) {
    const { getCourseById } = await import('./course/details.service');
    return getCourseById(courseId);
  }

  static async getStudentCourses(userId: string) {
    const { getEnrolledCourses } = await import('./course/student.service');
    return getEnrolledCourses(userId);
  }
}