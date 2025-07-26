// src/app/admin/categories/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CategoryDialog } from "@/components/admin/CategoryDialog";
import { CategoryManagement } from "@/components/admin/CategoryManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, BookOpen, Users, TrendingUp } from "lucide-react";

export default async function CategoriesPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [categories, stats] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { courses: true }
        },
        courses: {
          include: {
            _count: {
              select: { enrollments: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.$transaction([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.course.count(),
      prisma.enrollment.count()
    ])
  ]);

  const [totalCategories, activeCategories, totalCourses, totalEnrollments] = stats;

  // Calculate category statistics
  const categoryStats = categories.map(category => ({
    ...category,
    totalEnrollments: category.courses.reduce((sum, course) => sum + course._count.enrollments, 0)
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الفئات</h1>
          <p className="text-muted-foreground">إدارة فئات الدورات التعليمية</p>
        </div>
        <CategoryDialog />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الفئات</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {activeCategories} نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              في جميع الفئات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
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
            <CardTitle className="text-sm font-medium">متوسط الدورات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCategories > 0 ? Math.round(totalCourses / totalCategories * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              دورة لكل فئة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الفئات</CardTitle>
          <CardDescription>
            جميع فئات الدورات التعليمية في المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">لا توجد فئات</h3>
              <p className="mt-1 text-sm text-muted-foreground">ابدأ بإضافة أول فئة للمنصة</p>
              <div className="mt-6">
                <CategoryDialog />
              </div>
            </div>
          ) : (
            <CategoryManagement categories={categoryStats} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}