// src/app/api/student/enrolled-courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const studentId = session.user.id;

    // Get student's enrolled courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            category: true,
            professor: true,
            lessons: {
              orderBy: { order: 'asc' }
            }
          }
        },
        user: {
          include: {
            viewingHistory: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform enrollment data
    const courses = enrollments.map(enrollment => {
      const course = enrollment.course;
      const totalLessons = course.lessons.length;
      
      // Get viewing history for this course
      const courseViewingHistory = enrollment.user.viewingHistory.filter(vh => 
        course.lessons.some(lesson => lesson.id === vh.lessonId)
      );
      
      const completedLessons = courseViewingHistory.filter(vh => vh.completed).length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      // Calculate total duration and watched duration
      const totalDuration = course.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) / 60; // Convert to minutes
      const watchedDuration = courseViewingHistory.reduce((sum, vh) => sum + (vh.watchedDuration / 60), 0); // Convert to minutes
      
      // Determine status
      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in_progress';
      }
      
      // Find next lesson
      let nextLesson = null;
      if (status !== 'completed') {
        const completedLessonIds = new Set(courseViewingHistory.filter(vh => vh.completed).map(vh => vh.lessonId));
        nextLesson = course.lessons.find(lesson => !completedLessonIds.has(lesson.id));
      }
      
      // Get last accessed time
      const lastAccessedAt = courseViewingHistory.length > 0 
        ? new Date(Math.max(...courseViewingHistory.map(vh => new Date(vh.updatedAt).getTime())))
        : null;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        category: {
          name: course.category.name
        },
        professor: {
          name: course.professor.name
        },
        enrolledAt: enrollment.createdAt,
        progress: Math.round(progress),
        totalLessons,
        completedLessons,
        totalDuration: Math.round(totalDuration),
        watchedDuration: Math.round(watchedDuration),
        lastAccessedAt,
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          title: nextLesson.title,
          order: nextLesson.order
        } : null,
        certificateEarned: status === 'completed',
        status
      };
    });

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('Enrolled courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled courses' },
      { status: 500 }
    );
  }
}