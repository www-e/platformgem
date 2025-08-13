// src/app/api/courses/[id]/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/courses/[id]/analytics - Get course analytics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Get course and verify access
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        professorId: true,
        isPublished: true
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Check permissions
    if (session.user.role === 'PROFESSOR' && course.professorId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    } else if (session.user.role === 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Get course lessons
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        order: true,
        duration: true
      },
      orderBy: { order: 'asc' }
    });

    // Get enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Get viewing history for all lessons in this course
    const viewingHistory = await prisma.viewingHistory.findMany({
      where: {
        lessonId: { in: lessons.map(l => l.id) }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        lesson: {
          select: {
            id: true,
            title: true,
            order: true
          }
        }
      }
    });

    // Calculate analytics
    const totalStudents = enrollments.length;
    const totalLessons = lessons.length;
    const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

    // Student progress analytics
    const studentProgress = enrollments.map(enrollment => {
      const studentViewingHistory = viewingHistory.filter(vh => vh.user.id === enrollment.user.id);
      const completedLessons = studentViewingHistory.filter(vh => vh.completed).length;
      const totalWatchTime = studentViewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
      
      return {
        student: enrollment.user,
        enrolledAt: enrollment.enrolledAt,
        progressPercent: enrollment.progressPercent,
        completedLessons,
        totalWatchTime,
        lastAccessedAt: enrollment.lastAccessedAt
      };
    });

    // Lesson analytics
    const lessonAnalytics = lessons.map(lesson => {
      const lessonViewingHistory = viewingHistory.filter(vh => vh.lesson.id === lesson.id);
      const completedCount = lessonViewingHistory.filter(vh => vh.completed).length;
      const totalWatchTime = lessonViewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
      const averageWatchTime = lessonViewingHistory.length > 0 
        ? totalWatchTime / lessonViewingHistory.length 
        : 0;
      
      return {
        lesson: {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          duration: lesson.duration
        },
        completedCount,
        completionRate: totalStudents > 0 ? (completedCount / totalStudents) * 100 : 0,
        totalWatchTime,
        averageWatchTime,
        viewCount: lessonViewingHistory.length
      };
    });

    // Overall completion rate
    const totalCompletedLessons = viewingHistory.filter(vh => vh.completed).length;
    const overallCompletionRate = (totalLessons * totalStudents) > 0 
      ? (totalCompletedLessons / (totalLessons * totalStudents)) * 100 
      : 0;

    // Engagement metrics
    const totalWatchTime = viewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
    const averageWatchTimePerStudent = totalStudents > 0 ? totalWatchTime / totalStudents : 0;
    const engagementRate = totalDuration > 0 ? (totalWatchTime / (totalDuration * totalStudents)) * 100 : 0;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = viewingHistory.filter(vh => 
      new Date(vh.updatedAt) >= sevenDaysAgo
    ).length;

    const analytics = {
      course: {
        id: course.id,
        title: course.title
      },
      overview: {
        totalStudents,
        totalLessons,
        totalDuration,
        overallCompletionRate,
        engagementRate,
        recentActivity
      },
      students: studentProgress,
      lessons: lessonAnalytics,
      metrics: {
        totalWatchTime,
        averageWatchTimePerStudent,
        completedLessonsCount: totalCompletedLessons,
        activeStudentsLast7Days: new Set(
          viewingHistory
            .filter(vh => new Date(vh.updatedAt) >= sevenDaysAgo)
            .map(vh => vh.user.id)
        ).size
      }
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Course analytics error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}