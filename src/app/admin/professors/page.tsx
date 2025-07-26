// src/app/admin/professors/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CreateProfessorDialog } from "@/components/admin/CreateProfessorDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock } from "lucide-react";

export default async function ProfessorsPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const professors = await prisma.user.findMany({
    where: { role: 'PROFESSOR' },
    include: {
      ownedCourses: {
        include: {
          _count: {
            select: { enrollments: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalProfessors = professors.length;
  const totalCourses = professors.reduce((sum, prof) => sum + prof.ownedCourses.length, 0);
  const totalEnrollments = professors.reduce((sum, prof) => 
    sum + prof.ownedCourses.reduce((courseSum, course) => courseSum + course._count.enrollments, 0), 0
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">إدارة الأساتذة</h1>
          <p className="text-muted-foreground">إدارة حسابات الأساتذة والمدرسين</p>
        </div>
        <CreateProfessorDialog />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأساتذة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProfessors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Professors List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الأساتذة</CardTitle>
          <CardDescription>
            جميع الأساتذة المسجلين في المنصة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {professors.length === 0 ? (
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
              {professors.map((professor) => (
                <div key={professor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold">{professor.name}</h3>
                        <p className="text-sm text-muted-foreground" dir="ltr">{professor.phone}</p>
                        {professor.email && (
                          <p className="text-sm text-muted-foreground" dir="ltr">{professor.email}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={professor.isActive ? "default" : "secondary"}>
                          {professor.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </div>
                    
                    {professor.bio && (
                      <p className="text-sm text-muted-foreground mt-2">{professor.bio}</p>
                    )}
                    
                    {professor.expertise.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {professor.expertise.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {professor.ownedCourses.length} دورة
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {professor.ownedCourses.reduce((sum, course) => sum + course._count.enrollments, 0)} طالب
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}