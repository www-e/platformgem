// src/hooks/useProgressTracking.ts
'use client';

import { useEffect, useCallback } from 'react';
// Progress tracking hook for client-side milestone recording

interface UseProgressTrackingProps {
  courseId: string;
  completionRate: number;
  completedLessons: number;
  totalLessons: number;
  isEnrolled: boolean;
}

export function useProgressTracking({
  courseId,
  completionRate,
  completedLessons,
  totalLessons,
  isEnrolled
}: UseProgressTrackingProps) {
  
  const recordMilestone = useCallback(async (
    milestoneType: string, 
    metadata?: any
  ) => {
    try {
      const response = await fetch('/api/progress/milestone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          milestoneType,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record milestone');
      }
    } catch (error) {
      console.error('Failed to record milestone:', error);
    }
  }, [courseId]);

  // Track enrollment milestone
  useEffect(() => {
    if (isEnrolled) {
      recordMilestone('COURSE_START', {
        enrollmentDate: new Date().toISOString()
      });
    }
  }, [isEnrolled, recordMilestone]);

  // Track first lesson milestone
  useEffect(() => {
    if (completedLessons === 1) {
      recordMilestone('LESSON_COMPLETE', {
        firstLessonDate: new Date().toISOString()
      });
    }
  }, [completedLessons, recordMilestone]);

  // Track halfway milestone
  useEffect(() => {
    if (completionRate >= 50 && completionRate < 90) {
      recordMilestone('HALFWAY', {
        completionRate,
        completedLessons,
        totalLessons,
        halfwayDate: new Date().toISOString()
      });
    }
  }, [completionRate, completedLessons, totalLessons, recordMilestone]);

  // Track completion milestone
  useEffect(() => {
    if (completionRate >= 90) {
      recordMilestone('COMPLETION', {
        completionRate,
        completedLessons,
        totalLessons,
        completionDate: new Date().toISOString()
      });
    }
  }, [completionRate, completedLessons, totalLessons, recordMilestone]);

  return {
    recordMilestone
  };
}