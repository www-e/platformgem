// src/app/professor/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Clock, TrendingUp, Plus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default async function ProfessorDashboard() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'PROFESSOR') {
    redirect('/login');
  }

  // Fetch professor's data, courses and statistics
  const [professor, courses, stats] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    }),
    prisma.course.findMany({
      where: { professorId: session.user.id },
      include: {
        category: {
          select: {
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
      orderBy: { createdAt: 'desc' },
      take: 6 // Show latest 6 courses
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
      }),
      // Total lessons
      prisma.lesson.count({
        where: {
          course: { professorId: session.user.id }
        }
      })
    ])
  ]);

  const [totalCourses, publishedCourses, totalEnrollments, totalLessons] = stats;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الأستاذ</h1>
          <p className="text-muted-foreground">مرحباً {professor?.name || 'الأستاذ'}، إدارة دوراتك التعليمية</p>
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
              {publishedCourses} منشورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              طالب مسجل
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
              درس منشور
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التسجيل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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

      {/* Recent Courses */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>دوراتك الحديثة</CardTitle>
              <CardDescription>
                آخر الدورات التي أنشأتها
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/professor/courses">
                عرض جميع الدورات
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">لا توجد دورات</h3>
              <p className="mt-1 text-sm text-muted-foreground">ابدأ بإنشاء أول دورة لك</p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/professor/courses/new">
                    <Plus className="w-4 h-4" />
                    إنشاء دورة جديدة
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4 space-y-3">
                  {/* Course Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.category.name}</p>
                    </div>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          منشور
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          مسودة
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Course Image */}
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                      }}
                    />
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>الطلاب</span>
                      </div>
                      <div className="text-lg font-semibold">{course._count.enrollments}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>الدروس</span>
                      </div>
                      <div className="text-lg font-semibold">{course._count.lessons}</div>
                    </div>
                  </div>

                  {/* Course Price */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm font-medium">
                      {course.price ? (
                        <span className="text-primary">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: course.currency,
                            minimumFractionDigits: 0
                          }).format(Number(course.price))}
                        </span>
                      ) : (
                        <span className="text-green-600">مجاني</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/professor/courses/${course.id}`}>
                        إدارة
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إنشاء دورة جديدة</CardTitle>
            <CardDescription>
              ابدأ في إنشاء دورة تعليمية جديدة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/professor/courses/new">
                <Plus className="w-4 h-4" />
                إنشاء دورة
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إدارة الدورات</CardTitle>
            <CardDescription>
              عرض وإدارة جميع دوراتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/professor/courses">
                <BookOpen className="w-4 h-4" />
                عرض الدورات
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إحصائيات مفصلة</CardTitle>
            <CardDescription>
              عرض تقارير مفصلة عن أداء دوراتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/professor/analytics">
                <TrendingUp className="w-4 h-4" />
                عرض الإحصائيات
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}