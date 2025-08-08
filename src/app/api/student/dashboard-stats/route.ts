// src/app/api/student/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
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

    // Get actual certificates count from database
    const certificatesEarned = await prisma.certificate.count({
      where: { 
        userId: studentId,
        status: 'ACTIVE'
      }
    });

    // Calculate current streak from viewing history
    const recentViewingHistory = await prisma.viewingHistory.findMany({
      where: { 
        userId: studentId,
        updatedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Calculate streak based on consecutive days of activity
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const hasActivity = recentViewingHistory.some(vh => {
        const viewDate = new Date(vh.updatedAt);
        return viewDate >= checkDate && viewDate < nextDay;
      });
      
      if (hasActivity) {
        currentStreak++;
      } else {
        break;
      }
    }

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

    // Generate achievements based on actual progress
    const achievements = [];
    
    // First lesson completion achievement
    const firstCompletedLesson = await prisma.viewingHistory.findFirst({
      where: { 
        userId: studentId,
        completed: true
      },
      orderBy: { updatedAt: 'asc' }
    });
    
    if (firstCompletedLesson) {
      achievements.push({
        id: '1',
        title: 'أول خطوة',
        description: 'أكملت أول درس لك',
        icon: '🎯',
        earnedAt: firstCompletedLesson.updatedAt,
        category: 'completion' as const
      });
    }
    
    // Streak achievement
    if (currentStreak >= 5) {
      achievements.push({
        id: '2',
        title: 'متعلم نشط',
        description: `تعلمت لمدة ${currentStreak} أيام متتالية`,
        icon: '🔥',
        earnedAt: new Date(),
        category: 'streak' as const
      });
    }
    
    // Course completion achievement
    if (completedCourses > 0) {
      achievements.push({
        id: '3',
        title: 'منجز الدورات',
        description: `أكملت ${completedCourses} دورة`,
        icon: '🏆',
        earnedAt: new Date(),
        category: 'completion' as const
      });
    }

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
      upcomingDeadlines: [], // Will be populated when assignment system is implemented
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