// src/app/admin/professors/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateProfessorDialog } from "@/components/admin/CreateProfessorDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, DollarSign, TrendingUp, Star } from "lucide-react";

export default async function ProfessorsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  // Enhanced query with revenue, certificates, and completion data
  const professors = await prisma.user.findMany({
    where: { role: 'PROFESSOR' },
    include: {
      ownedCourses: {
        include: {
          enrollments: {
            select: { id: true, userId: true }
          },
          payments: {
            where: { status: 'COMPLETED' },
            select: { amount: true, currency: true }
          },
          certificates: {
            select: { id: true }
          },
          progressMilestones: {
            where: { milestoneType: 'COURSE_COMPLETE' },
            select: { id: true, userId: true }
          },
          _count: {
            select: { 
              enrollments: true,
              lessons: true,
              certificates: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate enhanced statistics for each professor
  const professorsWithStats = professors.map(professor => {
    const totalRevenue = professor.ownedCourses.reduce((sum, course) => {
      return sum + course.payments.reduce((courseSum, payment) => {
        return courseSum + Number(payment.amount);
      }, 0);
    }, 0);

    const totalEnrollments = professor.ownedCourses.reduce((sum, course) => sum + course._count.enrollments, 0);
    const totalCertificates = professor.ownedCourses.reduce((sum, course) => sum + course._count.certificates, 0);
    
    // Calculate completion rate
    const totalCompletions = professor.ownedCourses.reduce((sum, course) => {
      const uniqueCompletions = new Set(course.progressMilestones.map(p => p.userId)).size;
      return sum + uniqueCompletions;
    }, 0);
    
    const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

    return {
      ...professor,
      stats: {
        totalRevenue,
        totalEnrollments,
        totalCertificates,
        completionRate: Math.round(completionRate),
        coursesCount: professor.ownedCourses.length
      }
    };
  });

  // Sort professors by revenue (ranking)
  const rankedProfessors = professorsWithStats.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);

  const totalProfessors = professors.length;
  const totalCourses = professors.reduce((sum, prof) => sum + prof.ownedCourses.length, 0);
  const totalEnrollments = rankedProfessors.reduce((sum, prof) => sum + prof.stats.totalEnrollments, 0);
  const totalRevenue = rankedProfessors.reduce((sum, prof) => sum + prof.stats.totalRevenue, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأساتذة</h1>
          <p className="text-muted-foreground">إدارة حسابات الأساتذة والمدرسين</p>
        </div>
        <CreateProfessorDialog />
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأساتذة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfessors}</div>
            <p className="text-xs text-muted-foreground">أستاذ نشط</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">دورة منشورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">طالب مسجل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي المبيعات</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            أفضل الأساتذة أداءً
          </CardTitle>
          <CardDescription>
            ترتيب الأساتذة حسب الإيرادات والأداء
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankedProfessors.slice(0, 3).map((professor, index) => (
            <div key={professor.id} className="flex items-center gap-4 p-4 border rounded-lg mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{professor.name}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{professor.stats.coursesCount} دورة</span>
                  <span>{professor.stats.totalEnrollments} طالب</span>
                  <span>{professor.stats.completionRate}% معدل الإكمال</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format(professor.stats.totalRevenue)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {professor.stats.totalCertificates} شهادة
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Professors List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأساتذة التفصيلية</CardTitle>
          <CardDescription>
            جميع الأساتذة مع إحصائيات مفصلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankedProfessors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">لا يوجد أساتذة</h3>
              <p className="mt-1 text-sm text-muted-foreground">ابدأ بإضافة أول أستاذ للمنصة</p>
              <div className="mt-6">
                <CreateProfessorDialog />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rankedProfessors.map((professor, index) => (
                <div key={professor.id} className="p-6 border rounded-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{professor.name}</h3>
                        <p className="text-sm text-muted-foreground" dir="ltr">{professor.phone}</p>
                        {professor.email && (
                          <p className="text-sm text-muted-foreground" dir="ltr">{professor.email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={professor.isActive ? "default" : "secondary"}>
                        {professor.isActive ? "نشط" : "غير نشط"}
                      </Badge>
                      {index < 3 && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          متميز
                        </Badge>
                      )}
                    </div>
                  </div>

                  {professor.bio && (
                    <p className="text-sm text-muted-foreground mb-3">{professor.bio}</p>
                  )}
                  
                  {professor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {professor.expertise.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{professor.stats.coursesCount}</div>
                      <div className="text-xs text-muted-foreground">دورة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{professor.stats.totalEnrollments}</div>
                      <div className="text-xs text-muted-foreground">طالب</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{professor.stats.totalCertificates}</div>
                      <div className="text-xs text-muted-foreground">شهادة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{professor.stats.completionRate}%</div>
                      <div className="text-xs text-muted-foreground">معدل الإكمال</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        {new Intl.NumberFormat('ar-EG', {
                          style: 'currency',
                          currency: 'EGP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(professor.stats.totalRevenue)}
                      </div>
                      <div className="text-xs text-muted-foreground">إيرادات</div>
                    </div>
                  </div>

                  {/* Course Details */}
                  {professor.ownedCourses.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">الدورات ({professor.ownedCourses.length})</h4>
                      <div className="space-y-2">
                        {professor.ownedCourses.slice(0, 3).map((course) => (
                          <div key={course.id} className="flex justify-between items-center text-sm p-2 bg-background border rounded">
                            <span>{course.title}</span>
                            <div className="flex gap-2 text-muted-foreground">
                              <span>{course._count.enrollments} طالب</span>
                              <span>{course._count.certificates} شهادة</span>
                            </div>
                          </div>
                        ))}
                        {professor.ownedCourses.length > 3 && (
                          <div className="text-sm text-muted-foreground text-center">
                            و {professor.ownedCourses.length - 3} دورة أخرى...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}