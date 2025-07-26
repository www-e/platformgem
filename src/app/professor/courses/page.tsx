// src/app/professor/courses/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProfessorCourseManagement } from "@/components/professor/ProfessorCourseManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Users, Clock } from "lucide-react";
import Link from "next/link";

export default async function ProfessorCoursesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'PROFESSOR') {
    redirect('/login');
  }

  // Fetch professor's courses with detailed information
  const [courses, stats] = await Promise.all([
    prisma.course.findMany({
      where: { professorId: session.user.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.$transaction([
      // Total courses
      prisma.course.count({
        where: { professorId: session.user.id }
      }),
      // Published courses
      prisma.course.count({
        where: { professorId: session.user.id, isPublished: true }
      }),
      // Total enrollments
      prisma.enrollment.count({
        where: {
          course: { professorId: session.user.id }
        }
      })
    ])
  ]);

  const [totalCourses, publishedCourses, totalEnrollments] = stats;

  // Calculate additional statistics
  const draftCourses = totalCourses - publishedCourses;
  const totalLessons = courses.reduce((sum, course) => sum + course._count.lessons, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الدورات</h1>
          <p className="text-muted-foreground">إدارة وتنظيم دوراتك التعليمية</p>
        </div>
        <Button asChild>
          <Link href="/professor/courses/new">
            <Plus className="w-4 h-4" />
            إنشاء دورة جديدة
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {publishedCourses} منشورة، {draftCourses} مسودة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلاب المسجلون</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              في جميع الدورات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدروس</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              درس في جميع الدورات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCourses > 0 ? Math.round(totalEnrollments / totalCourses * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              طالب لكل دورة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Management */}
      <Card>
        <CardHeader>
          <CardTitle>دوراتك التعليمية</CardTitle>
          <CardDescription>
            إدارة وتنظيم جميع دوراتك التعليمية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">لا توجد دورات</h3>
              <p className="mt-2 text-muted-foreground">
                ابدأ رحلتك التعليمية بإنشاء أول دورة لك
              </p>
              <div className="mt-6">
                <Button asChild size="lg">
                  <Link href="/professor/courses/new">
                    <Plus className="w-5 h-5" />
                    إنشاء دورة جديدة
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <ProfessorCourseManagement courses={courses} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}