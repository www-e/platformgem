// src/hooks/useAdminAnalytics.ts

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// We'll keep the type definition here for now, co-located with the hook that uses it.
export interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    activeUsers: number;
    publishedCourses: number;
  };
  userStats: {
    students: number;
    professors: number;
    admins: number;
    newUsersThisMonth: number;
    activeUsersThisWeek: number;
  };
  courseStats: {
    totalLessons: number;
    totalWatchTime: number;
    averageCompletionRate: number;
    topCategories: Array<{
      name: string;
      courseCount: number;
      enrollmentCount: number;
    }>;
  };
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageOrderValue: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
  };
  topCourses: Array<{
    id: string;
    title: string;
    professor: string;
    enrollments: number;
    revenue: number;
    completionRate: number;
  }>;
  topProfessors: Array<{
    id: string;
    name: string;
    coursesCount: number;
    totalEnrollments: number;
    totalRevenue: number;
  }>;
  recentActivity: Array<{
    type: 'enrollment' | 'payment' | 'course_created' | 'lesson_completed';
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export type TimeRange = 'week' | 'month' | 'year';

/**
 * Custom hook to fetch and manage admin analytics data.
 * @param timeRange - The time range for which to fetch analytics ('week', 'month', 'year').
 * @returns An object containing the analytics data, loading state, and error state.
 */
export function useAdminAnalytics(timeRange: TimeRange) {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في تحميل الإحصائيات');
        }

        const data: PlatformAnalytics = await response.json();
        setAnalytics(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [timeRange]);

  return { analytics, loading, error };
}