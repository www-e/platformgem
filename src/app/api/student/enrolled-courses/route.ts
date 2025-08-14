// src/app/api/student/enrolled-courses/route.ts
import { NextRequest } from 'next/server';
import { CourseService } from '@/lib/services/course/index.service';
import { 
  createSuccessResponse,
  authenticateStudent,
  isAuthError,
  withErrorHandling
} from '@/lib/api';

export const GET = withErrorHandling(async (_request: NextRequest) => {
  // Authenticate student
  const authResult = await authenticateStudent();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Get enrolled courses using service
  const courses = await CourseService.getEnrolledCourses(authResult.user.id);

  return createSuccessResponse({ courses });
});