// src/app/api/professor/student-engagement/route.ts
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

    const { searchParams } = new URL(_request.url);
    const courseFilter = searchParams.get('course') || 'all';
    const period = searchParams.get('period') || 'month';
    const professorId = session.user.id;

    // Get professor's courses
    const coursesQuery = {
      where: { 
        professorId,
        ...(courseFilter !== 'all' ? { id: courseFilter } : {})
      },
      include: {
        enrollments: {
          include: {
            user: {
              include: {
                // Correctly include viewingHistory nested under user
                viewingHistory: {
                  include: {
                    lesson: true
                  }
                }
              }
            }
          }
        },
        lessons: true
      }
    };

    const courses = await prisma.course.findMany(coursesQuery);

    // Calculate period boundaries
    const now = new Date();
    const periodStart = new Date();
    
    switch (period) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      default: // month
        periodStart.setMonth(now.getMonth() - 1);
    }

    // Get all enrollments
    const allEnrollments = courses.flatMap(course => course.enrollments);

    // Calculate active students (those with activity in the period)
    const activeStudents = new Set(
      allEnrollments.filter(enrollment =>
        enrollment.user.viewingHistory.some((vh: any) => new Date(vh.updatedAt) >= periodStart)
      ).map(e => e.userId)
    ).size;

    const totalActiveStudents = activeStudents;

    // Calculate average watch time per student
    const totalWatchTime = allEnrollments.reduce((total, enrollment) => {
      return total + enrollment.user.viewingHistory
        .filter((vh: any) => new Date(vh.updatedAt) >= periodStart)
        .reduce((enrollmentTotal: number, vh: any) => enrollmentTotal + (vh.watchedDuration / 60), 0);
    }, 0);

    const averageWatchTime = totalActiveStudents > 0 ? totalWatchTime / totalActiveStudents : 0;

    // Calculate completion rate
    const completedEnrollments = allEnrollments.filter(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) return false;
      
      const totalLessons = course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter((vh: any) => vh.completed).length;
      
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    const completionRate = allEnrollments.length > 0 ? (completedEnrollments / allEnrollments.length) * 100 : 0;

    // Calculate engagement score (composite metric)
    const engagementScore = Math.min(100, (
      (completionRate * 0.4) + 
      (Math.min(100, averageWatchTime / 30 * 100) * 0.3) + // 30 minutes = 100%
      (Math.min(100, totalActiveStudents / Math.max(1, allEnrollments.length) * 100) * 0.3)
    ));

    // Student activities
    const studentActivities = allEnrollments
      .flatMap(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        return enrollment.user.viewingHistory
          .filter((vh: any) => new Date(vh.updatedAt) >= periodStart)
          .map((vh: any) => {
            const totalLessons = course?.lessons.length || 0;
            const completedLessons = enrollment.user.viewingHistory.filter((vhc: any) => vhc.completed).length;
            const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

            return {
              id: `${enrollment.id}-${vh.id}`,
              studentName: enrollment.user.name,
              courseName: course?.title || 'Unknown Course',
              activityType: vh.completed ? 'lesson_complete' : 'video_watch' as const,
              duration: Math.round(vh.watchedDuration / 60),
              timestamp: vh.updatedAt,
              progress: Math.round(progress)
            };
          });
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    // Course engagement
    const courseEngagement = courses.map(course => {
      const courseEnrollments = course.enrollments;
      const activeCourseStudents = courseEnrollments.filter(enrollment =>
        enrollment.user.viewingHistory.some((vh: any) => new Date(vh.updatedAt) >= periodStart)
      ).length;

      const courseWatchTime = courseEnrollments.reduce((total, enrollment) => {
        return total + enrollment.user.viewingHistory
          .filter((vh: any) => new Date(vh.updatedAt) >= periodStart)
          .reduce((enrollmentTotal: number, vh: any) => enrollmentTotal + (vh.watchedDuration / 60), 0);
      }, 0);

      const averageCourseWatchTime = activeCourseStudents > 0 ? courseWatchTime / activeCourseStudents : 0;

      const courseCompletions = courseEnrollments.filter(enrollment => {
        const totalLessons = course.lessons.length;
        const completedLessons = enrollment.user.viewingHistory.filter((vh: any) => vh.completed).length;
        return totalLessons > 0 && completedLessons === totalLessons;
      }).length;

      const courseCompletionRate = courseEnrollments.length > 0 ? (courseCompletions / courseEnrollments.length) * 100 : 0;

      const averageCourseProgress = courseEnrollments.reduce((sum, enrollment) => {
        const totalLessons = course.lessons.length;
        const completedLessons = enrollment.user.viewingHistory.filter((vh: any) => vh.completed).length;
        return sum + (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);
      }, 0) / Math.max(1, courseEnrollments.length);

      const courseEngagementScore = Math.min(100, (
        (courseCompletionRate * 0.4) + 
        (Math.min(100, averageCourseWatchTime / 30 * 100) * 0.3) +
        (Math.min(100, activeCourseStudents / Math.max(1, courseEnrollments.length) * 100) * 0.3)
      ));

      return {
        courseId: course.id,
        courseName: course.title,
        totalStudents: courseEnrollments.length,
        activeStudents: activeCourseStudents,
        averageProgress: Math.round(averageCourseProgress),
        averageWatchTime: Math.round(averageCourseWatchTime),
        completionRate: Math.round(courseCompletionRate),
        engagementScore: Math.round(courseEngagementScore)
      };
    });

    // Weekly engagement (last 4 weeks)
    const weeklyEngagement = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekActiveStudents = new Set(
        allEnrollments.filter(enrollment =>
          enrollment.user.viewingHistory.some((vh: any) => {
            const vhDate = new Date(vh.updatedAt);
            return vhDate >= weekStart && vhDate < weekEnd;
          })
        ).map(e => e.userId)
      ).size;

      const weekWatchTime = allEnrollments.reduce((total, enrollment) => {
        return total + enrollment.user.viewingHistory
          .filter((vh: any) => {
            const vhDate = new Date(vh.updatedAt);
            return vhDate >= weekStart && vhDate < weekEnd;
          })
          .reduce((enrollmentTotal: number, vh: any) => enrollmentTotal + (vh.watchedDuration / 60), 0);
      }, 0);

      const weekCompletedLessons = allEnrollments.reduce((total, enrollment) => {
        return total + enrollment.user.viewingHistory
          .filter((vh: any) => {
            const vhDate = new Date(vh.updatedAt);
            return vh.completed && vhDate >= weekStart && vhDate < weekEnd;
          }).length;
      }, 0);

      const weekEngagementScore = Math.min(100, (
        (weekActiveStudents / Math.max(1, allEnrollments.length) * 100 * 0.5) +
        (Math.min(100, weekWatchTime / Math.max(1, weekActiveStudents) / 30 * 100) * 0.5)
      ));

      weeklyEngagement.push({
        week: `${weekStart.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}`,
        activeStudents: weekActiveStudents,
        totalWatchTime: Math.round(weekWatchTime),
        completedLessons: weekCompletedLessons,
        engagementScore: Math.round(weekEngagementScore)
      });
    }

    // Top engaged students
    const studentEngagementMap = new Map();
    
    allEnrollments.forEach(enrollment => {
      const userId = enrollment.userId;
      const userName = enrollment.user.name;
      
      if (!studentEngagementMap.has(userId)) {
        studentEngagementMap.set(userId, {
          id: userId,
          name: userName,
          totalWatchTime: 0,
          completedCourses: 0,
          totalProgress: 0,
          courseCount: 0,
          lastActivity: new Date(0),
          activities: 0
        });
      }
      
      const student = studentEngagementMap.get(userId);
      student.courseCount++;
      
      const course = courses.find(c => c.id === enrollment.courseId);
      const totalLessons = course?.lessons.length || 0;
      const completedLessons = enrollment.user.viewingHistory.filter((vh: any) => vh.completed).length;
      const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      
      student.totalProgress += courseProgress;
      student.totalWatchTime += enrollment.user.viewingHistory.reduce((total: number, vh: any) => {
        return total + (vh.watchedDuration / 60);
      }, 0);
      
      if (courseProgress === 100) {
        student.completedCourses++;
      }
      
      // Update last activity
      enrollment.user.viewingHistory.forEach((vh: any) => {
        if (new Date(vh.updatedAt) > student.lastActivity) {
          student.lastActivity = new Date(vh.updatedAt);
        }
      });
      
      student.activities += enrollment.user.viewingHistory.length;
    });

    const topEngagedStudents = Array.from(studentEngagementMap.values())
      .map(student => {
        const averageProgress = student.courseCount > 0 ? student.totalProgress / student.courseCount : 0;
        const engagementScore = Math.min(100, (
          (averageProgress * 0.4) +
          (Math.min(100, student.totalWatchTime / 60 * 100) * 0.3) + // 1 hour = 100%
          (Math.min(100, student.activities / 10 * 100) * 0.3) // 10 activities = 100%
        ));
        
        return {
          ...student,
          totalWatchTime: Math.round(student.totalWatchTime),
          averageProgress: Math.round(averageProgress),
          engagementScore: Math.round(engagementScore)
        };
      })
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 10);

    // Mock recent interactions (would come from a comments/questions system)
    const recentInteractions = [
      {
        id: '1',
        studentName: 'أحمد محمد',
        courseName: 'أساسيات التغذية الرياضية',
        type: 'question' as const,
        content: 'ما هي أفضل الأوقات لتناول البروتين؟',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        needsResponse: true
      },
      {
        id: '2',
        studentName: 'فاطمة أحمد',
        courseName: 'تمارين القوة للمبتدئين',
        type: 'completion' as const,
        content: 'أكملت الوحدة الثالثة بنجاح!',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        needsResponse: false
      }
    ];

    const engagementData = {
      totalActiveStudents,
      averageWatchTime: Math.round(averageWatchTime),
      completionRate: Math.round(completionRate),
      engagementScore: Math.round(engagementScore),
      studentActivities,
      courseEngagement,
      weeklyEngagement,
      topEngagedStudents,
      recentInteractions
    };

    return NextResponse.json(engagementData);

  } catch (error) {
    console.error('Student engagement error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student engagement data' },
      { status: 500 }
    );
  }
}