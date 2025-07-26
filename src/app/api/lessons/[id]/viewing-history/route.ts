// src/app/api/lessons/[id]/viewing-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: { id: string }
}

// Schema for viewing history updates
const updateViewingHistorySchema = z.object({
  watchedDuration: z.number().min(0),
  totalDuration: z.number().min(0),
  lastPosition: z.number().min(0),
  completed: z.boolean().optional()
});

// GET /api/lessons/[id]/viewing-history - Get viewing history for a lesson
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id: lessonId } = params;

    // Verify lesson exists and user has access
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            professorId: true,
            isPublished: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
    }

    // Check if user has access to this lesson
    if (session.user.role === 'STUDENT') {
      // Check enrollment for students
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: lesson.course.id
          }
        }
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'غير مسجل في هذه الدورة' }, { status: 403 });
      }
    } else if (session.user.role === 'PROFESSOR') {
      // Check if professor owns the course
      if (lesson.course.professorId !== session.user.id) {
        return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
      }
    }
    // Admins have access to all lessons

    // Get or create viewing history
    const viewingHistory = await prisma.viewingHistory.findUnique({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      }
    });

    if (!viewingHistory) {
      // Create initial viewing history record
      const newViewingHistory = await prisma.viewingHistory.create({
        data: {
          userId: session.user.id,
          lessonId,
          watchedDuration: 0,
          totalDuration: lesson.duration || 0,
          lastPosition: 0,
          completed: false
        }
      });

      return NextResponse.json(newViewingHistory);
    }

    return NextResponse.json(viewingHistory);

  } catch (error) {
    console.error('Get viewing history error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/lessons/[id]/viewing-history - Update viewing history
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id: lessonId } = params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateViewingHistorySchema.parse(body);

    // Verify lesson exists and user has access
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            professorId: true,
            isPublished: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 });
    }

    // Check if user has access to this lesson (students only)
    if (session.user.role === 'STUDENT') {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: lesson.course.id
          }
        }
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'غير مسجل في هذه الدورة' }, { status: 403 });
      }
    }

    // Determine completion status
    const isCompleted = validatedData.completed ?? 
      (validatedData.watchedDuration >= (validatedData.totalDuration * 0.9)); // 90% completion threshold

    // Update or create viewing history
    const viewingHistory = await prisma.viewingHistory.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId
        }
      },
      update: {
        watchedDuration: validatedData.watchedDuration,
        totalDuration: validatedData.totalDuration,
        lastPosition: validatedData.lastPosition,
        completed: isCompleted,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        lessonId,
        watchedDuration: validatedData.watchedDuration,
        totalDuration: validatedData.totalDuration,
        lastPosition: validatedData.lastPosition,
        completed: isCompleted
      }
    });

    // Update enrollment progress if this is a student
    if (session.user.role === 'STUDENT') {
      await updateEnrollmentProgress(session.user.id, lesson.course.id);
    }

    return NextResponse.json(viewingHistory);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'بيانات غير صحيحة',
        details: error.issues 
      }, { status: 400 });
    }

    console.error('Update viewing history error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

// Helper function to update enrollment progress
async function updateEnrollmentProgress(userId: string, courseId: string) {
  try {
    // Get all lessons in the course
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      select: { id: true }
    });

    // Get completed lessons for this user
    const completedLessons = await prisma.viewingHistory.findMany({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) },
        completed: true
      },
      select: { lessonId: true }
    });

    // Calculate progress percentage
    const progressPercent = lessons.length > 0 
      ? Math.round((completedLessons.length / lessons.length) * 100)
      : 0;

    // Get total watch time for this course
    const totalWatchTime = await prisma.viewingHistory.aggregate({
      where: {
        userId,
        lessonId: { in: lessons.map(l => l.id) }
      },
      _sum: {
        watchedDuration: true
      }
    });

    // Update enrollment
    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      },
      data: {
        progressPercent,
        completedLessonIds: completedLessons.map(cl => cl.lessonId),
        totalWatchTime: totalWatchTime._sum.watchedDuration || 0,
        lastAccessedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error updating enrollment progress:', error);
    // Don't throw error as this is a background operation
  }
}