// src/components/professor/CourseAnalytics.tsx
'use client';

import { useCourseAnalytics } from '@/hooks/useCourseAnalytics';
import { AnalyticsHeader } from './course-analytics/AnalyticsHeader';
import { OverviewCards } from './course-analytics/OverviewCards';
import { LessonPerformanceCard } from './course-analytics/LessonPerformanceCard';
import { StudentEngagementCard } from './course-analytics/StudentEngagementCard';
import { BestWorstLessonsCards } from './course-analytics/BestWorstLessonsCards';
import { WeeklyPerformanceCard } from './course-analytics/WeeklyPerformanceCard';
import { LoadingState } from './course-analytics/LoadingState';
import { EmptyState } from './course-analytics/EmptyState';

export function CourseAnalytics() {
  const {
    analytics,
    selectedCourse,
    setSelectedCourse,
    selectedCourseData,
    isLoading
  } = useCourseAnalytics();

  if (isLoading) {
    return <LoadingState />;
  }

  if (analytics.length === 0) {
    return <EmptyState type="no-courses" />;
  }

  if (!selectedCourseData) {
    return <EmptyState type="no-selection" />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        analytics={analytics}
        selectedCourse={selectedCourse}
        onCourseChange={setSelectedCourse}
      />

      <OverviewCards courseData={selectedCourseData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LessonPerformanceCard courseData={selectedCourseData} />
        <StudentEngagementCard courseData={selectedCourseData} />
      </div>

      <BestWorstLessonsCards courseData={selectedCourseData} />

      <WeeklyPerformanceCard courseData={selectedCourseData} />
    </div>
  );
}