// src/lib/services/database/optimization.service.ts

import prisma from '@/lib/prisma';

/**
 * Optimized query for course with enrollment check
 */
export async function getCourseWithEnrollmentStatus(
  courseId: string,
  userId?: string
) {
  const [course, enrollment] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        isPublished: true,
        professorId: true,
        thumbnailUrl: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        professor: {
          select: {
            id: true,
            name: true,
            bio: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    }),
    userId ? prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        id: true,
        enrolledAt: true,
        progressPercent: true,
        lastAccessedAt: true,
        totalWatchTime: true,
      },
    }) : null,
  ]);

  return { course, enrollment };
}

/**
 * Optimized query for user's payments with course info
 */
export async function getUserPaymentsWithCourses(userId: string) {
  return prisma.payment.findMany({
    where: { userId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      createdAt: true,
      completedAt: true,
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          professor: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Batch update enrollment progress
 */
export async function batchUpdateEnrollmentProgress(
  updates: Array<{
    userId: string;
    courseId: string;
    progressPercent: number;
    completedLessonIds: string[];
    totalWatchTime: number;
  }>
) {
  const updatePromises = updates.map(update =>
    prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: update.userId,
          courseId: update.courseId,
        },
      },
      data: {
        progressPercent: update.progressPercent,
        completedLessonIds: update.completedLessonIds,
        totalWatchTime: update.totalWatchTime,
        lastAccessedAt: new Date(),
      },
    })
  );

  return Promise.allSettled(updatePromises);
}

/**
 * Get enrollment analytics for a course
 */
export async function getCourseEnrollmentAnalytics(courseId: string) {
  const [
    totalEnrollments,
    completedEnrollments,
    averageProgress,
    recentEnrollments,
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { courseId },
    }),
    prisma.enrollment.count({
      where: { 
        courseId,
        progressPercent: 100,
      },
    }),
    prisma.enrollment.aggregate({
      where: { courseId },
      _avg: {
        progressPercent: true,
      },
    }),
    prisma.enrollment.count({
      where: {
        courseId,
        enrolledAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
  ]);

  return {
    totalEnrollments,
    completedEnrollments,
    averageProgress: Math.round(averageProgress._avg.progressPercent || 0),
    completionRate: totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0,
    recentEnrollments,
  };
}
