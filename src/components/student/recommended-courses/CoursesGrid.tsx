// src/components/student/recommended-courses/CoursesGrid.tsx
import { CourseCard } from './CourseCard';
import type { RecommendedCourse } from '@/hooks/useRecommendedCourses';

interface CoursesGridProps {
  courses: RecommendedCourse[];
  onToggleWishlist: (courseId: string) => void;
}

export function CoursesGrid({ courses, onToggleWishlist }: CoursesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}