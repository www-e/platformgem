// src/app/api/student/dashboard-stats/route.ts
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

    // Get student's enrollments with course and viewing history data
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            lessons: true,
            payments: {
              where: { 
                userId: studentId,
                status: 'COMPLETED'
              }
            }
          }
        },
        user: {
          include: {
            viewingHistory: {
              where: {
                lesson: {
                  course: {
                    enrollments: {
                      some: { userId: studentId }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Calculate basic stats
    const totalEnrolledCourses = enrollments.length;
    
    let completedCourses = 0;
    let inProgressCourses = 0;
    let totalWatchTime = 0;
    let totalProgress = 0;
    let totalSpent = 0;

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      const totalLessons = course.lessons.length;
      
      // Get viewing history for this course
      const courseViewingHistory = enrollment.user.viewingHistory.filter(vh => 
        course.lessons.some(lesson => lesson.id === vh.lessonId)
      );
      
      const completedLessons = courseViewingHistory.filter(vh => vh.completed).length;
      const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      totalProgress += courseProgress;
      
      // Calculate watch time for this course
      const courseWatchTime = courseViewingHistory.reduce((sum, vh) => sum + (vh.watchedDuration / 60), 0);
      totalWatchTime += courseWatchTime;
      
      // Determine course status
      if (courseProgress === 100) {
        completedCourses++;
      } else if (courseProgress > 0) {
        inProgressCourses++;
      }
      
      // Calculate spending
      const coursePayments = course.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      totalSpent += coursePayments;
    }

    const averageProgress = totalEnrolledCourses > 0 ? totalProgress / totalEnrolledCourses : 0;

    // Get certificates count (mock for now)
    const certificatesEarned = completedCourses;

    // Calculate current streak (mock implementation)
    const currentStreak = Math.floor(Math.random() * 15) + 1; // 1-15 days

    // Generate recent activity
    const recentActivity = [];
    for (let i = 0; i < 5; i++) {
      const enrollment = enrollments[Math.floor(Math.random() * enrollments.length)];
      if (enrollment) {
        recentActivity.push({
          id: `activity-${i}`,
          type: ['lesson_complete', 'course_enroll', 'quiz_passed'][Math.floor(Math.random() * 3)],
          courseName: enrollment.course.title,
          lessonName: enrollment.course.lessons[0]?.title || 'درس تجريبي',
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
          progress: Math.floor(Math.random() * 100)
        });
      }
    }

    // Generate achievements (mock)
    const achievements = [
      {
        id: '1',
        title: 'أول خطوة',
        description: 'أكملت أول درس لك',
        icon: '🎯',
        earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        category: 'completion' as const
      },
      {
        id: '2',
        title: 'متعلم نشط',
        description: 'تعلمت لمدة 5 أيام متتالية',
        icon: '🔥',
        earnedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        category: 'streak' as const
      }
    ];

    const stats = {
      totalEnrolledCourses,
      completedCourses,
      inProgressCourses,
      totalWatchTime: Math.round(totalWatchTime),
      averageProgress: Math.round(averageProgress * 10) / 10,
      certificatesEarned,
      totalSpent,
      currentStreak,
      recentActivity,
      upcomingDeadlines: [], // Mock empty for now
      achievements
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Student dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}