// src/components/course/course-card/CourseStats.tsx
import { BookOpen, Clock, Users, Star } from 'lucide-react';
import { formatCourseDuration } from '@/lib/course-utils';
import { CourseWithMetadata } from '@/types/course';

interface CourseStatsProps {
  course: CourseWithMetadata;
  viewMode: 'grid' | 'list';
}

export function CourseStats({ course, viewMode }: CourseStatsProps) {
  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{course.lessonCount} درس</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatCourseDuration(course.totalDuration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{course.enrollmentCount} طالب</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span>{course.averageRating} ({course.reviewCount})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <BookOpen className="w-4 h-4" />
        <span>{course.lessonCount} درس</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        <span>{formatCourseDuration(course.totalDuration)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="w-4 h-4" />
        <span>{course.enrollmentCount} طالب</span>
      </div>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400 fill-current" />
        <span>{course.averageRating}</span>
      </div>
    </div>
  );
}