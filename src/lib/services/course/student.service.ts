// src/lib/services/course/student.service.ts

import prisma from '@/lib/prisma';
import { EnrolledCourse } from '@/types/course';
import {
  calculateCourseDuration,
  calculateCourseProgress,
  getCourseStatus,
} from '@/lib/course-utils';

/**
 * Get all enrolled courses for a specific student, including their progress.
 * @param userId - The ID of the student.
 * @returns A promise that resolves to an array of enrolled courses with detailed progress.
 */
export async function getEnrolledCourses(
  userId: string
): Promise<EnrolledCourse[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          category: { select: { name: true } },
          professor: { select: { name: true } },
          lessons: {
            select: { id: true, title: true, order: true, duration: true },
            orderBy: { order: 'asc' },
          },
        },
      },
      // Note: Including the entire viewing history for every enrollment can be inefficient.
      // A more optimized query might fetch this separately or use an aggregate.
      // For now, we are preserving the original logic.
      user: {
        include: { viewingHistory: true },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  return enrollments.map((enrollment) => {
    const { course } = enrollment;

    // Filter viewing history to only this course's lessons
    const lessonIds = new Set(course.lessons.map((l) => l.id));
    const courseViewingHistory = enrollment.user.viewingHistory.filter((vh) =>
      lessonIds.has(vh.lessonId)
    );

    const completedLessons = courseViewingHistory.filter(
      (vh) => vh.completed
    ).length;
    const progress = calculateCourseProgress(
      course.lessons.length,
      completedLessons
    );

    const watchedDuration = Math.round(
      courseViewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0) / 60
    );

    const status = getCourseStatus(progress);
    let nextLesson = null;
    if (status !== 'completed') {
      const completedLessonIds = new Set(
        courseViewingHistory.filter((vh) => vh.completed).map((vh) => vh.lessonId)
      );
      nextLesson =
        course.lessons.find((lesson) => !completedLessonIds.has(lesson.id)) ||
        null;
    }

    const lastAccessedAt =
      courseViewingHistory.length > 0
        ? new Date(
            Math.max(...courseViewingHistory.map((vh) => new Date(vh.updatedAt).getTime()))
          )
        : enrollment.lastAccessedAt;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      category: { name: course.category.name },
      professor: { name: course.professor.name },
      enrolledAt: enrollment.enrolledAt,
      progress,
      totalLessons: course.lessons.length,
      completedLessons,
      totalDuration: calculateCourseDuration(course.lessons),
      watchedDuration,
      lastAccessedAt,
      nextLesson: nextLesson
        ? { id: nextLesson.id, title: nextLesson.title, order: nextLesson.order }
        : null,
      certificateEarned: status === 'completed',
      status,
    };
  });
}