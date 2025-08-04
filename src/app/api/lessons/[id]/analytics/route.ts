// src/app/api/lessons/[id]/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: lessonId } = params;
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Verify lesson exists and user has access
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            professorId: true,
            title: true
          }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Check permissions
    const canView = session.user.role === 'ADMIN' || 
                   (session.user.role === 'PROFESSOR' && lesson.course.professorId === session.user.id);

    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range
    const days = range === '30d' ? 30 : range === '90d' ? 90 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get viewing history data
    const viewingHistory = await prisma.viewingHistory.findMany({
      where: {
        lessonId,
        updatedAt: {
          gte: startDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Calculate analytics
    const totalViews = viewingHistory.length;
    const uniqueViewers = new Set(viewingHistory.map(vh => vh.userId)).size;
    const totalWatchTime = viewingHistory.reduce((sum, vh) => sum + vh.watchedDuration, 0);
    const averageWatchTime = totalViews > 0 ? totalWatchTime / totalViews : 0;
    
    // Calculate completion rate
    const completedViews = viewingHistory.filter(vh => vh.completed).length;
    const completionRate = totalViews > 0 ? (completedViews / totalViews) * 100 : 0;

    // Get top viewers
    const viewerStats = viewingHistory.reduce((acc, vh) => {
      if (!acc[vh.userId]) {
        acc[vh.userId] = {
          userId: vh.userId,
          userName: vh.user.name,
          watchTime: 0,
          totalDuration: vh.totalDuration,
          completed: false
        };
      }
      acc[vh.userId].watchTime = Math.max(acc[vh.userId].watchTime, vh.watchedDuration);
      if (vh.completed) acc[vh.userId].completed = true;
      return acc;
    }, {} as Record<string, any>);

    const topViewers = Object.values(viewerStats)
      .map((viewer: any) => ({
        ...viewer,
        completionRate: viewer.totalDuration > 0 ? (viewer.watchTime / viewer.totalDuration) * 100 : 0
      }))
      .sort((a: any, b: any) => b.watchTime - a.watchTime);

    // Calculate drop-off points (simplified)
    const dropOffPoints = [];
    if (lesson.duration) {
      const intervals = 10; // Check 10 points throughout the video
      const intervalDuration = lesson.duration / intervals;
      
      for (let i = 1; i <= intervals; i++) {
        const timePoint = intervalDuration * i;
        const viewersAtPoint = viewingHistory.filter(vh => vh.lastPosition >= timePoint).length;
        const dropOffPercentage = totalViews > 0 ? ((totalViews - viewersAtPoint) / totalViews) * 100 : 0;
        
        if (dropOffPercentage > 10) { // Only show significant drop-offs
          dropOffPoints.push({
            time: timePoint,
            percentage: dropOffPercentage
          });
        }
      }
    }

    // Generate daily engagement data
    const viewerEngagement = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayViews = viewingHistory.filter(vh => 
        vh.updatedAt >= dayStart && vh.updatedAt <= dayEnd
      );
      
      viewerEngagement.push({
        date: dayStart.toISOString().split('T')[0],
        views: dayViews.length,
        watchTime: dayViews.reduce((sum, vh) => sum + vh.watchedDuration, 0)
      });
    }

    const analytics = {
      totalViews,
      uniqueViewers,
      totalWatchTime,
      averageWatchTime,
      completionRate,
      dropOffPoints,
      viewerEngagement,
      topViewers: topViewers.slice(0, 10)
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}