// src/components/professor/StudentEngagement.tsx
'use client';

import { useStudentEngagement } from '@/hooks/useStudentEngagement';
import { EngagementHeader } from './student-engagement/EngagementHeader';
import { EngagementOverview } from './student-engagement/EngagementOverview';
import { CourseEngagementCard } from './student-engagement/CourseEngagementCard';
import { TopStudentsCard } from './student-engagement/TopStudentsCard';
import { RecentActivitiesCard } from './student-engagement/RecentActivitiesCard';
import { RecentInteractionsCard } from './student-engagement/RecentInteractionsCard';
import { LoadingState } from './student-engagement/LoadingState';

export function StudentEngagement() {
  const {
    engagementData,
    isLoading,
    selectedCourse,
    setSelectedCourse,
    selectedPeriod,
    setSelectedPeriod
  } = useStudentEngagement();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!engagementData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل بيانات التفاعل</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EngagementHeader
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
        courseEngagement={engagementData.courseEngagement}
      />

      <EngagementOverview data={engagementData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CourseEngagementCard courseEngagement={engagementData.courseEngagement} />
        <TopStudentsCard topStudents={engagementData.topEngagedStudents} />
      </div>

      <RecentActivitiesCard activities={engagementData.studentActivities} />

      <RecentInteractionsCard interactions={engagementData.recentInteractions} />
    </div>
  );
}