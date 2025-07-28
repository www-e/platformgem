// src/app/api/professor/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const professorId = session.user.id;

    // Get professor's courses
    const courses = await prisma.course.findMany({
      where: { professorId },
      include: {
        enrollments: {
          include: {
            user: true,
            viewingHistory: true
          }
        },
        payments: {
          where: { status: 'COMPLETED' }
        },
        lessons: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      }
    });

    // Calculate statistics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(course => course.isPublished).length;
    const draftCourses = totalCourses - publishedCourses;

    // Get all enrollments for professor's courses
    const allEnrollments = courses.flatMap(course => course.enrollments);
    const totalStudents = new Set(allEnrollments.map(e => e.userId)).size;

    // Calculate total earnings
    const totalEarnings = courses.reduce((sum, course) => {
      return sum + course.payments.reduce((courseSum, payment) => {
        return courseSum + Number(payment.amount);
      }, 0);
    }, 0);

    // Calculate monthly earnings (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyEarnings = courses.reduce((sum, course) => {
      return sum + course.payments
        .filter(payment => new Date(payment.createdAt) >= currentMonth)
        .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0);
    }, 0);

    // Calculate average rating (mock for now)
    const averageRating = 4.5;

    // Calculate total views (sum of all viewing history)
    const totalViews = allEnrollments.reduce((sum, enrollment) => {
      return sum + enrollment.viewingHistory.length;
    }, 0);

    // Calculate completion rate
    const completedEnrollments = allEnrollments.filter(enrollment => {
      const course = courses.find(c => c.id === enrollment.courseId);
      if (!course) return false;
      
      const totalLessons = course.lessons.length;
      const completedLessons = enrollment.viewingHistory.filter(vh => vh.completed).length;
      
      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    const completionRate = allEnrollments.length > 0 ? (completedEnrollments / allEnrollments.length) * 100 : 0;

    // Get recent enrollments
    const recentEnrollments = allEnrollments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(enrollment => {
        const course = courses.find(c => c.id === enrollment.courseId);
        const totalLessons = course?.lessons.length || 0;
        const completedLessons = enrollment.viewingHistory.filter(vh => vh.completed).length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          id: enrollment.id,
          studentName: enrollment.user.name,
          courseName: course?.title || 'Unknown Course',
          enrolledAt: enrollment.createdAt,
          progress: Math.round(progress)
        };
      });

    // Get top courses by earnings
    const topCourses = courses
      .map(course => {
        const earnings = course.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const students = course.enrollments.length;
        const completedStudents = course.enrollments.filter(enrollment => {
          const totalLessons = course.lessons.length;
          const completedLessons = enrollment.viewingHistory.filter(vh => vh.completed).length;
          return totalLessons > 0 && completedLessons === totalLessons;
        }).length;
        
        const completionRate = students > 0 ? (completedStudents / students) * 100 : 0;

        return {
          id: course.id,
          title: course.title,
          students,
          earnings,
          rating: 4.5, // Mock rating
          completionRate: Math.round(completionRate)
        };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Generate monthly stats (last 6 months)
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthEarnings = courses.reduce((sum, course) => {
        return sum + course.payments
          .filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
          })
          .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0);
      }, 0);

      const monthEnrollments = allEnrollments.filter(enrollment => {
        const enrollmentDate = new Date(enrollment.createdAt);
        return enrollmentDate >= monthStart && enrollmentDate <= monthEnd;
      }).length;

      const monthCourses = courses.filter(course => {
        const courseDate = new Date(course.createdAt);
        return courseDate >= monthStart && courseDate <= monthEnd;
      }).length;

      monthlyStats.push({
        month: date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        earnings: monthEarnings,
        students: monthEnrollments,
        courses: monthCourses
      });
    }

    const dashboardStats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalEarnings,
      monthlyEarnings,
      averageRating,
      totalViews,
      completionRate,
      recentEnrollments,
      topCourses,
      monthlyStats
    };

    return NextResponse.json(dashboardStats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}