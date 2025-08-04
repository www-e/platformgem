// src/components/student/RecommendedCourses.tsx
'use client';

import { useRecommendedCourses } from '@/hooks/useRecommendedCourses';
import { RecommendationsHeader } from './recommended-courses/RecommendationsHeader';
import { CourseFilters } from './recommended-courses/CourseFilters';
import { CoursesGrid } from './recommended-courses/CoursesGrid';
import { EmptyState } from './recommended-courses/EmptyState';
import { LoadingState } from './recommended-courses/LoadingState';

export function RecommendedCourses() {
  const {
    isLoading,
    filters,
    setFilters,
    filteredCourses,
    toggleWishlist,
    resetFilters
  } = useRecommendedCourses();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <RecommendationsHeader />

      <CourseFilters filters={filters} setFilters={setFilters} />

      {filteredCourses.length > 0 ? (
        <CoursesGrid courses={filteredCourses} onToggleWishlist={toggleWishlist} />
      ) : (
        <EmptyState onResetFilters={resetFilters} />
      )}
    </div>
  );
}