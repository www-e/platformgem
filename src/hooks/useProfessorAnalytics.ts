// src/hooks/useProfessorAnalytics.ts
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CourseAnalytics {
  course: {
    id: string;
    title: string;
  };
  overview: {
    totalStudents: number;
    totalLessons: number;
    totalDuration: number;
    overallCompletionRate: number;
    engagementRate: number;
    recentActivity: number;
  };
  students: Array<{
    student: {
      id: string;
      name: string;
      email: string;
    };
    enrolledAt: string;
    progressPercent: number;
    completedLessons: number;
    totalWatchTime: number;
    lastAccessedAt: string | null;
  }>;
  lessons: Array<{
    lesson: {
      id: string;
      title: string;
      order: number;
      duration: number | null;
    };
    completedCount: number;
    completionRate: number;
    totalWatchTime: number;
    averageWatchTime: number;
    viewCount: number;
  }>;
  metrics: {
    totalWatchTime: number;
    averageWatchTimePerStudent: number;
    completedLessonsCount: number;
    activeStudentsLast7Days: number;
  };
}

export function useProfessorAnalytics(courseId: string) {
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}/analytics`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "فشل في تحميل الإحصائيات");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchAnalytics();
    }
  }, [courseId]);

  const refetch = () => {
    if (courseId) {
      setLoading(true);
      setError(null);
      // Re-trigger the effect by updating a dependency
      window.location.reload();
    }
  };

  return {
    analytics,
    loading,
    error,
    refetch,
  };
}

export type { CourseAnalytics };
