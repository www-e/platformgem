// src/app/api/videos/[videoId]/secure-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { bunnyService } from '@/lib/bunny';

interface RouteParams {
  params: { videoId: string }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { videoId } = params;
    const { lessonId } = await request.json();

    // Verify user has access to this video through lesson enrollment
    const lesson = await prisma.lesson.findUnique({
      where: { 
        id: lessonId,
        bunnyVideoId: videoId 
      },
      include: {
        course: {
          select: {
            id: true,
            bunnyLibraryId: true,
            professorId: true,
            isPublished: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Check access permissions
    let hasAccess = false;

    if (session.user.role === 'ADMIN') {
      hasAccess = true;
    } else if (session.user.role === 'PROFESSOR') {
      hasAccess = lesson.course.professorId === session.user.id;
    } else if (session.user.role === 'STUDENT') {
      // Check enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: lesson.course.id
          }
        }
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get client IP for additional security
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';

    // Generate secure URL with enhanced security
    const secureUrl = bunnyService.generateSecureUrl(
      lesson.course.bunnyLibraryId,
      videoId,
      {
        expirationTime: 3600, // 1 hour
        userIp: clientIp.split(',')[0].trim(),
        userId: session.user.id,
        preventDownload: true
      }
    );

    if (!secureUrl) {
      return NextResponse.json({ error: 'Failed to generate secure URL' }, { status: 500 });
    }

    // Log video access for analytics
    try {
      await prisma.viewingHistory.upsert({
        where: {
          userId_lessonId: {
            userId: session.user.id,
            lessonId: lesson.id
          }
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          userId: session.user.id,
          lessonId: lesson.id,
          watchedDuration: 0,
          totalDuration: lesson.duration || 0,
          lastPosition: 0,
          completed: false
        }
      });
    } catch (error) {
      console.error('Error logging video access:', error);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      secureUrl,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      videoId,
      lessonId: lesson.id
    });

  } catch (error) {
    console.error('Secure URL generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}