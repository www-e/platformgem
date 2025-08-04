// src/lib/services/enrollment/progress.service.ts

import prisma from '@/lib/prisma';

/**
 * A type representing the progress data to be updated for an enrollment.
 */
export type EnrollmentProgress = {
  completedLessonIds: string[];
  progressPercent: number;
  totalWatchTime: number;
  lastAccessedAt: Date;
};

/**
 * Updates the progress metrics for a specific enrollment.
 * @param enrollmentId - The ID of the enrollment to update.
 * @param progress - An object containing the progress data.
 * @returns A promise that resolves to true if the update was successful, otherwise false.
 */
export async function updateEnrollmentProgress(
  enrollmentId: string,
  progress: EnrollmentProgress
): Promise<boolean> {
  try {
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completedLessonIds: progress.completedLessonIds,
        progressPercent: progress.progressPercent,
        totalWatchTime: progress.totalWatchTime,
        lastAccessedAt: progress.lastAccessedAt,
        updatedAt: new Date(),
      },
    });

    return true;
  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    return false;
  }
}