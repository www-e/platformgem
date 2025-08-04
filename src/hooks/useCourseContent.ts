// src/hooks/useCourseContent.ts
"use client";

import { useState } from "react";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useProgressTracking } from "@/hooks/useProgressTracking";

interface Lesson {
  id: string;
  title: string;
  order: number;
  duration: number | null;
  bunnyVideoId: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  bunnyLibraryId: string;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

export function useCourseContent(course: Course, lessons: Lesson[]) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    lessons.length > 0 ? lessons[0] : null
  );
  const [lessonProgress, setLessonProgress] = useState<Record<string, number>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const { viewingHistory, batchUpdateViewingHistory } = useViewingHistory(
    selectedLesson?.id || ''
  );

  // Calculate overall progress
  const completedCount = completedLessons.size;
  const overallProgress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;
  const totalWatchedTime = Object.values(lessonProgress).reduce((sum, time) => sum + time, 0);

  const totalDuration = lessons.reduce((total, lesson) => {
    return total + (lesson.duration || 0);
  }, 0);

  // Track progress milestones
  useProgressTracking({
    courseId: course.id,
    completionRate: overallProgress,
    completedLessons: completedCount,
    totalLessons: lessons.length,
    isEnrolled: true // Assuming user is enrolled if they can see content
  });

  // Handle lesson completion
  const handleLessonComplete = () => {
    if (selectedLesson) {
      setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
    }
  };

  // Handle progress updates
  const handleProgressUpdate = (progress: {
    watchedDuration: number;
    totalDuration: number;
    lastPosition: number;
    completed: boolean;
  }) => {
    if (selectedLesson) {
      setLessonProgress(prev => ({
        ...prev,
        [selectedLesson.id]: progress.watchedDuration
      }));

      if (progress.completed) {
        setCompletedLessons(prev => new Set([...prev, selectedLesson.id]));
      }

      // Update viewing history via API
      batchUpdateViewingHistory(progress);
    }
  };

  return {
    selectedLesson,
    setSelectedLesson,
    lessonProgress,
    completedLessons,
    viewingHistory,
    overallProgress,
    totalWatchedTime,
    totalDuration,
    completedCount,
    handleLessonComplete,
    handleProgressUpdate
  };
}

export type { Lesson, Course };