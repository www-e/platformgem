// src/components/course/course-catalog/CoursesGrid.tsx
import { UserRole } from '@prisma/client';
import { CourseWithMetadata } from '@/types/course';
import CourseCard from '../CourseCard';

interface CoursesGridProps {
  courses: CourseWithMetadata[];
  viewMode: 'grid' | 'list';
  userRole?: UserRole;
  userId?: string;
}

export function CoursesGrid({ courses, viewMode, userRole, userId }: CoursesGridProps) {
  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
    }>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          userRole={userRole}
          userId={userId}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}