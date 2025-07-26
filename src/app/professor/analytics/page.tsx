// src/app/professor/analytics/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfessorAnalytics } from "@/components/analytics/ProfessorAnalytics";
import { 
  BarChart3, 
  BookOpen, 
  Users, 
  TrendingUp,
  ArrowLeft,
  Calendar,
  Clock
} from "lucide-react";
import Link from "next/link";

interface SearchParams {
  courseId?: string;
}

export default async function ProfessorAnalyticsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'PROFESSOR') {
    redirect('/login');
  }

  // Get professor's courses for selection
  const courses = await prisma.course.findMany({
    where: { professorId: session.user.id },
    include: {
      category: {
        select: { name: true }
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Get overall statistics
  const overallStats = await prisma.$transaction([
    // Total students across all courses
    prisma.enrollment.count({
      where: {
        course: { professorId: session.user.id }
      }
    }),
    // Total watch time across all courses
    prisma.viewingHistory.aggregate({
      where: {
        lesson: {
          course: { professorId: session.user.id }
        }
      },
      _sum: {
        watchedDuration: true
      }
    }),
    // Completed lessons count
    prisma.viewingHistory.count({
      where: {
        lesson: {
          course: { professorId: session.user.id }
        },
        completed: true
      }
    }),
    // Recent activity (last 7 days)
    prisma.viewingHistory.count({
      where: {
        lesson: {
          course: { professorId: session.user.id }
        },
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })
  ]);

  const [totalStudents, totalWatchTimeResult, completedLessons, recentActivity] = overallStats;
  const totalWatchTime = totalWatchTimeResult._sum.watchedDuration || 0;

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  const selectedCourseId = searchParams.courseId;
  const selectedCourse = selectedCourseId 
    ? courses.find(c => c.id === selectedCourseId)
    : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/professor">
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              إحصائيات مفصلة
            </h1>
            <p className="text-muted-foreground">
              {selectedCourse 
                ? `إحصائيات دورة: ${selectedCourse.title}`
                : 'نظرة عامة على جميع دوراتك'
              }
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          <Calendar className="w-3 h-3 mr-1" />
          {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Course Selection */}
      {!selectedCourseId && (
        <>
          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
                <BookOpen className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  {courses.filter(c => c.isPublished).length} منشورة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">
                  طالب مسجل
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">وقت المشاهدة الإجمالي</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(totalWatchTime)}</div>
                <p className="text-xs text-muted-foreground">
                  {totalStudents > 0 ? formatTime(totalWatchTime / totalStudents) : '0 دقيقة'} متوسط لكل طالب
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">النشاط الحديث</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentActivity}</div>
                <p className="text-xs text-muted-foreground">
                  نشاط خلال 7 أيام
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Course Selection Grid */}
          <Card>
            <CardHeader>
              <CardTitle>اختر دورة لعرض الإحصائيات المفصلة</CardTitle>
              <CardDescription>
                انقر على أي دورة لعرض إحصائيات مفصلة عن أداء الطلاب والدروس
              </CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">لا توجد دورات</h3>
                  <p className="text-muted-foreground mb-6">
                    ابدأ بإنشاء أول دورة لك لعرض الإحصائيات
                  </p>
                  <Button asChild>
                    <Link href="/professor/courses/new">
                      إنشاء دورة جديدة
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/professor/analytics?courseId=${course.id}`}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg line-clamp-2">
                                {course.title}
                              </CardTitle>
                              <CardDescription>
                                {course.category.name}
                              </CardDescription>
                            </div>
                            <Badge variant={course.isPublished ? "default" : "secondary"}>
                              {course.isPublished ? "منشور" : "مسودة"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <Users className="w-3 h-3" />
                                <span>الطلاب</span>
                              </div>
                              <div className="font-semibold">{course._count.enrollments}</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                                <BookOpen className="w-3 h-3" />
                                <span>الدروس</span>
                              </div>
                              <div className="font-semibold">{course._count.lessons}</div>
                            </div>
                          </div>
                          <div className="mt-4 text-center">
                            <Button variant="outline" size="sm" className="w-full">
                              <BarChart3 className="w-4 h-4" />
                              عرض الإحصائيات
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Selected Course Analytics */}
      {selectedCourseId && selectedCourse && (
        <ProfessorAnalytics courseId={selectedCourseId} />
      )}

      {/* Course Not Found */}
      {selectedCourseId && !selectedCourse && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">الدورة غير موجودة</h3>
            <p className="text-muted-foreground mb-6">
              الدورة المطلوبة غير موجودة أو غير مصرح لك بالوصول إليها
            </p>
            <Button asChild>
              <Link href="/professor/analytics">
                العودة لقائمة الدورات
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}