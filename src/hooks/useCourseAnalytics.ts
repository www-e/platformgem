// src/hooks/useCourseAnalytics.ts
"use client";

import { useState, useEffect } from 'react';

interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalWatchTime: number; // in minutes
  averageWatchTime: number;
  totalLessons: number;
  mostWatchedLesson: {
    id: string;
    title: string;
    watchTime: number;
    completionRate: number;
  } | null;
  leastWatchedLesson: {
    id: string;
    title: string;
    watchTime: number;
    completionRate: number;
  } | null;
  lessonAnalytics: Array<{
    id: string;
    title: string;
    order: number;
    duration: number;
    watchTime: number;
    completionRate: number;
    dropOffRate: number;
    averageEngagement: number;
  }>;
  studentEngagement: Array<{
    studentId: string;
    studentName: string;
    progress: number;
    watchTime: number;
    lastActivity: Date;
    engagementScore: number;
  }>;
  weeklyStats: Array<{
    week: string;
    enrollments: number;
    watchTime: number;
    completions: number;
  }>;
}

export function useCourseAnalytics() {
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseAnalytics();
  }, []);

  const fetchCourseAnalytics = async () => {
    try {
      const response = await fetch('/api/professor/course-analytics');
      const data = await response.json();
      setAnalytics(data.analytics);
      if (data.analytics.length > 0) {
        setSelectedCourse(data.analytics[0].courseId);
      }
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseData = analytics.find(course => course.courseId === selectedCourse);

  return {
    analytics,
    selectedCourse,
    setSelectedCourse,
    selectedCourseData,
    isLoading,
    refetch: fetchCourseAnalytics
  };
}

export type { CourseAnalytics };