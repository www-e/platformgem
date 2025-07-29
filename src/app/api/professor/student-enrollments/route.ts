// src/app/api/professor/student-enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const professorId = session.user.id;

    // Get all enrollments for professor's courses
    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          professorId
        }
      },
      include: {
        user: true,
        course: {
          include: {
            lessons: true
          }
        },
        viewingHistory: true
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

    // Transform enrollments data
    const enrollmentData = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.viewingHistory.filter(vh => vh.completed).length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      // Calculate total time spent
      const timeSpent = enrollment.viewingHistory.reduce((total, vh) => {
        return total + (vh.watchedDuration / 60); // Convert to minutes
      }, 0);

      // Determine completion status
      let completionStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (completedLessons === totalLessons && totalLessons > 0) {
        completionStatus = 'completed';
      } else if (completedLessons > 0) {
        completionStatus = 'in_progress';
      }

      // Get last activity
      const lastActivity = enrollment.viewingHistory.length > 0 
        ? new Date(Math.max(...enrollment.viewingHistory.map(vh => new Date(vh.updatedAt).getTime())))
        : enrollment.createdAt;

      return {
        id: enrollment.id,
        studentName: enrollment.user.name,
        studentEmail: enrollment.user.email || '',
        courseName: enrollment.course.title,
        enrolledAt: enrollment.createdAt,
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