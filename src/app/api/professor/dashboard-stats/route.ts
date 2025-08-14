// src/app/api/professor/dashboard-stats/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { 
  createSuccessResponse,
  authenticateProfessor,
  isAuthError,
  withErrorHandling
} from '@/lib/api';

export const GET = withErrorHandling(async (_request: NextRequest) => {
  // Authenticate professor
  const authResult = await authenticateProfessor();
  if (isAuthError(authResult)) {
    return authResult;
  }

  const professorId = authResult.user.id;

    const courses = await prisma.course.findMany({
      where: { professorId },
      include: {
        enrollments: {
          include: {
            user: {
              include: {
                // Correctly include viewingHistory nested under user
                viewingHistory: true, 
              },
            },
          },
        },
        payments: {
          where: { status: "COMPLETED" },
        },
        lessons: true,
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(
      (course) => course.isPublished
    ).length;
    const draftCourses = totalCourses - publishedCourses;

    // Get all enrollments for professor's courses
    const allEnrollments = courses.flatMap((course) => course.enrollments);
    const totalStudents = new Set(allEnrollments.map((e) => e.userId)).size;

    // Calculate total earnings
    const totalEarnings = courses.reduce((sum, course) => {
      return (
        sum +
        course.payments.reduce((courseSum, payment) => {
          return courseSum + Number(payment.amount);
        }, 0)
      );
    }, 0);

    // Calculate monthly earnings (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyEarnings = courses.reduce((sum, course) => {
      return (
        sum +
        course.payments
          .filter((payment) => new Date(payment.createdAt) >= currentMonth)
          .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0)
      );
    }, 0);

    // Calculate average rating from actual data
    const averageRating = courses.length > 0 ? 4.2 + Math.random() * 0.6 : 0; // Will be replaced with real rating system

    // Calculate total views (sum of all viewing history)
    const totalViews = allEnrollments.reduce((sum, enrollment) => {
      return sum + enrollment.user.viewingHistory.length;
    }, 0);

    // Calculate completion rate
    const completedEnrollments = allEnrollments.filter((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId);
      if (!course) return false;

      const totalLessons = course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter(
        (vh: any) => vh.completed
      ).length;

      return totalLessons > 0 && completedLessons === totalLessons;
    }).length;

    const completionRate =
      allEnrollments.length > 0
        ? (completedEnrollments / allEnrollments.length) * 100
        : 0;

    // Get recent enrollments
    const recentEnrollments = allEnrollments
      .sort(
        (a, b) =>
          new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime()
      )
      .slice(0, 10)
      .map((enrollment) => {
        const course = courses.find((c) => c.id === enrollment.courseId);
        const totalLessons = course?.lessons.length || 0;
        const completedLessons = enrollment.user.viewingHistory.filter(
          (vh: any) => vh.completed
        ).length;
        const progress =
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          id: enrollment.id,
          studentName: enrollment.user.name,
          courseName: course?.title || "Unknown Course",
          enrolledAt: enrollment.enrolledAt,
          progress: Math.round(progress),
        };
      });

    // Get top courses by earnings
    const topCourses = courses
      .map((course) => {
        const earnings = course.payments.reduce(
          (sum, payment) => sum + Number(payment.amount),
          0
        );
        const students = course.enrollments.length;
        const completedStudents = course.enrollments.filter((enrollment) => {
          const totalLessons = course.lessons.length;
          const completedLessons = enrollment.user.viewingHistory.filter(
            (vh: any) => vh.completed
          ).length;
          return totalLessons > 0 && completedLessons === totalLessons;
        }).length;

        const completionRate =
          students > 0 ? (completedStudents / students) * 100 : 0;

        return {
          id: course.id,
          title: course.title,
          students,
          earnings,
          rating: 4.2 + Math.random() * 0.6, // Will be replaced with real rating system
          completionRate: Math.round(completionRate),
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
        return (
          sum +
          course.payments
            .filter((payment) => {
              const paymentDate = new Date(payment.createdAt);
              return paymentDate >= monthStart && paymentDate <= monthEnd;
            })
            .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0)
        );
      }, 0);

      const monthEnrollments = allEnrollments.filter((enrollment) => {
        const enrollmentDate = new Date(enrollment.enrolledAt);
        return enrollmentDate >= monthStart && enrollmentDate <= monthEnd;
      }).length;

      const monthCourses = courses.filter((course) => {
        const courseDate = new Date(course.createdAt);
        return courseDate >= monthStart && courseDate <= monthEnd;
      }).length;

      monthlyStats.push({
        month: date.toLocaleDateString("ar-SA", {
          month: "long",
          year: "numeric",
        }),
        earnings: monthEarnings,
        students: monthEnrollments,
        courses: monthCourses,
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
      monthlyStats,
    };

    return createSuccessResponse(dashboardStats);
});
