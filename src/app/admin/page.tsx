// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";

async function getStats() {
  const [userCount, courseCount] = await prisma.$transaction([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.course.count(),
  ]);
  return { userCount, courseCount };
}

export default async function AdminDashboardPage() {
  const { userCount, courseCount } = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم الرئيسية</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الطلاب</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{userCount}</div>
            <p className="text-xs text-muted-foreground">طالب مسجل في المنصة</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الدورات</CardTitle>
            <BookOpen className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{courseCount}</div>
            <p className="text-xs text-muted-foreground">دورة متاحة للتسجيل</p>
          </CardContent>
        </Card>
        
        {/* Additional stat cards can be added here in the future */}

      </div>
    </div>
  );
}