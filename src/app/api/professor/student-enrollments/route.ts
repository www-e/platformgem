// src/app/api/professor/student-enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { EnrollmentWithHistory } from '@/lib/types/db';
import type { ViewingHistory } from '@prisma/client';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const professorId = session.user.id;

    // R.A.K.A.N: The Prisma query is now corrected to match the type definition perfectly.
    const enrollments: EnrollmentWithHistory[] = await prisma.enrollment.findMany({
      where: {
        course: {
          professorId
        }
      },
      include: {
        user: {
          include: {
            // FIX: This nested include was missing. It's now corrected.
            viewingHistory: {
              include: {
                lesson: true,
              },
            },
          }
        },
        course: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    const enrollmentData = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter((vh) => vh.completed).length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      const timeSpent = enrollment.user.viewingHistory.reduce((total: number, vh) => {
        return total + (vh.watchedDuration / 60); // Convert to minutes
      }, 0);

      let completionStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (completedLessons === totalLessons && totalLessons > 0) {
        completionStatus = 'completed';
      } else if (completedLessons > 0) {
        completionStatus = 'in_progress';
      }

      const lastActivity = enrollment.user.viewingHistory.length > 0
        ? new Date(Math.max(...enrollment.user.viewingHistory.map((vh) => new Date(vh.updatedAt).getTime())))
        : enrollment.enrolledAt;

      return {
        id: enrollment.id,
        studentName: enrollment.user.name,
        studentEmail: enrollment.user.email || '',
        courseName: enrollment.course.title,
        enrolledAt: enrollment.enrolledAt,
        progress: Math.round(progress),
        lastActivity,
        completionStatus,
        timeSpent: Math.round(timeSpent),
        certificateEarned: completionStatus === 'completed'
      };
    });

    return NextResponse.json({ enrollments: enrollmentData });

  } catch (error) {
    console.error('Student enrollments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student enrollments' },
      { status: 500 }
    );
  }
}