// src/app/api/professor/enrollment-stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { EnrollmentWithHistory } from "@/lib/types/db";
import type { ViewingHistory } from '@prisma/client';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "PROFESSOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const professorId = session.user.id;

    // R.A.K.A.N: The Prisma query is now corrected to match the type definition.
    const enrollments: EnrollmentWithHistory[] = await prisma.enrollment.findMany({
      where: {
        course: {
          professorId,
        },
      },
      include: {
        user: {
          include: {
            // FIX: This nested include was missing, causing the type error.
            viewingHistory: {
              include: {
                lesson: true,
              },
            },
          },
        },
        course: {
          include: {
            lessons: true,
          },
        },
      },
    });

    const totalEnrollments = enrollments.length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeStudents = new Set(
      enrollments
        .filter((enrollment) =>
          enrollment.user.viewingHistory.some(
            (vh: ViewingHistory) => new Date(vh.updatedAt) >= thirtyDaysAgo
          )
        )
        .map((e) => e.userId)
    ).size;

    const completedCourses = enrollments.filter((enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter(
        (vh: ViewingHistory) => vh.completed
      ).length;
      return totalLessons > 0 && completedLessons >= totalLessons;
    }).length;

    const totalProgress = enrollments.reduce((sum, enrollment) => {
      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter(
        (vh: ViewingHistory) => vh.completed
      ).length;
      return sum + (totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0);
    }, 0);

    const averageProgress = totalEnrollments > 0 ? totalProgress / totalEnrollments : 0;
    const certificatesIssued = completedCourses;

    const totalTimeSpent = enrollments.reduce((total, enrollment) => {
      return (
        total +
        enrollment.user.viewingHistory.reduce((enrollmentTotal: number, vh: ViewingHistory) => {
          return enrollmentTotal + vh.watchedDuration / 60; // Convert to minutes
        }, 0)
      );
    }, 0);

    const enrollmentsByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthEnrollments = enrollments.filter((enrollment) => {
        const enrollmentDate = new Date(enrollment.enrolledAt);
        return enrollmentDate >= monthStart && enrollmentDate <= monthEnd;
      });

      const monthCompletions = monthEnrollments.filter((enrollment) => {
        const totalLessons = enrollment.course.lessons.length;
        const completedLessons = enrollment.user.viewingHistory.filter(
          (vh: ViewingHistory) => vh.completed
        ).length;
        return totalLessons > 0 && completedLessons >= totalLessons;
      }).length;

      enrollmentsByMonth.push({
        month: date.toLocaleDateString("ar-SA", { month: "long", year: "numeric" }),
        enrollments: monthEnrollments.length,
        completions: monthCompletions,
      });
    }

    // R.A.K.A.N: Restored and fully typed the topPerformers logic.
    const studentPerformance = new Map<string, {
      studentName: string;
      coursesCompleted: number;
      totalScore: number;
      courseCount: number;
      totalTimeSpent: number;
    }>();

    enrollments.forEach((enrollment) => {
      const userId = enrollment.userId;
      const userName = enrollment.user.name;

      if (!studentPerformance.has(userId)) {
        studentPerformance.set(userId, {
          studentName: userName,
          coursesCompleted: 0,
          totalScore: 0,
          courseCount: 0,
          totalTimeSpent: 0,
        });
      }

      const student = studentPerformance.get(userId)!; // We know it exists from the check above
      student.courseCount++;

      const totalLessons = enrollment.course.lessons.length;
      const completedLessons = enrollment.user.viewingHistory.filter(
        (vh: ViewingHistory) => vh.completed
      ).length;
      const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      student.totalScore += courseProgress;
      student.totalTimeSpent += enrollment.user.viewingHistory.reduce(
        (total: number, vh: ViewingHistory) => total + vh.watchedDuration / 60,
        0
      );

      if (courseProgress === 100) {
        student.coursesCompleted++;
      }
    });

    const topPerformers = Array.from(studentPerformance.values())
      .map((student) => ({
        studentName: student.studentName,
        coursesCompleted: student.coursesCompleted,
        averageScore: student.courseCount > 0 ? student.totalScore / student.courseCount : 0,
        totalTimeSpent: Math.round(student.totalTimeSpent),
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    const stats = {
      totalEnrollments,
      activeStudents,
      completedCourses,
      averageProgress: Math.round(averageProgress * 10) / 10,
      certificatesIssued,
      totalTimeSpent: Math.round(totalTimeSpent),
      enrollmentsByMonth,
      topPerformers,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Enrollment stats error:", error);
    return NextResponse.json({ error: "Failed to fetch enrollment statistics" }, { status: 500 });
  }
}