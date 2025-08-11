// src/components/analytics/ProfessorAnalytics.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProfessorAnalytics } from '@/hooks/useProfessorAnalytics';
import { AnalyticsHeader } from './professor/AnalyticsHeader';
import { OverviewCards } from './professor/OverviewCards';
import { StudentsTab } from './professor/StudentsTab';
import { LessonsTab } from './professor/LessonsTab';
import { OverviewTab } from './professor/OverviewTab';
import { LoadingState } from './professor/LoadingState';
import { ErrorState } from './professor/ErrorState';

interface ProfessorAnalyticsProps {
  courseId: string;
}

export function ProfessorAnalytics({ courseId }: ProfessorAnalyticsProps) {
  const { analytics, loading, error, refetch } = useProfessorAnalytics(courseId);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !analytics) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader courseTitle={analytics.course.title} />
      
      <OverviewCards analytics={analytics} />

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">الملتحقين</TabsTrigger>
          <TabsTrigger value="lessons">الدروس</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <StudentsTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <LessonsTab analytics={analytics} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}