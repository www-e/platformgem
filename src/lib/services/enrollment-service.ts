// src/lib/services/enrollment-service.ts
// Backward compatibility layer for the old enrollment service

export { enrollInFreeCourse, createPaidEnrollment, EnrollmentService } from './enrollment/core.service';
export { checkCourseAccess as checkEnrollmentAccess } from './enrollment/access.service';
export { updateEnrollmentProgress as getEnrollmentProgress } from './enrollment/progress.service';
export { getUserEnrollments as getEnrollmentsByUser, getUserEnrollments as getEnrollmentsByCourse } from './enrollment/query.service';

// Re-export all enrollment-related functions for backward compatibility
export * from './enrollment/core.service';
export * from './enrollment/access.service';
export * from './enrollment/progress.service';
export * from './enrollment/query.service';
export * from './enrollment/types';