// src/hooks/useStudentEngagement.ts
"use client";

import { useState, useEffect } from 'react';

interface EngagementData {
  totalActiveStudents: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  studentActivities: StudentActivity[];
  courseEngagement: CourseEngagement[];
  weeklyEngagement: WeeklyEngagement[];
  topEngagedStudents: TopStudent[];
  recentInteractions: RecentInteraction[];
}

interface StudentActivity {
  id: string;
  studentName: string;
  courseName: string;
  activityType: 'video_watch' | 'lesson_complete' | 'quiz_attempt' | 'comment';
  duration?: number; // for video_watch
  timestamp: Date;
  progress: number;
}

interface CourseEngagement {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
}

interface WeeklyEngagement {
  week: string;
  activeStudents: number;
  totalWatchTime: number;
  completedLessons: number;
  engagementScore: number;
}

interface TopStudent {
  id: string;
  name: string;
  totalWatchTime: number;
  completedCourses: number;
  averageProgress: number;
  lastActivity: Date;
  engagementScore: number;
}

interface RecentInteraction {
  id: string;
  studentName: string;
  courseName: string;
  type: 'question' | 'comment' | 'completion' | 'milestone';
  content: string;
  timestamp: Date;
  needsResponse: boolean;
}

export function useStudentEngagement() {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchEngagementData();
  }, [selectedCourse, selectedPeriod]);

  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/professor/student-engagement?course=${selectedCourse}&period=${selectedPeriod}`);
      const data = await response.json();
      setEngagementData(data);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    engagementData,
    isLoading,
    selectedCourse,
    setSelectedCourse,
    selectedPeriod,
    setSelectedPeriod,
    refetch: fetchEngagementData
  };
}

export type { 
  EngagementData, 
  StudentActivity, 
  CourseEngagement, 
  TopStudent, 
  RecentInteraction 
};