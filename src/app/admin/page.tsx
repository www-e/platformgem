// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";
import UserChart from "@/components/admin/UserChart";

async function getDashboardData() {
  const [userCount, courseCount, users] = await prisma.$transaction([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.course.count(),
    prisma.user.findMany({
      where: { isAdmin: false },
      select: { createdAt: true }
    }),
  ]);

  // Process data for the chart
  const monthlySignups = users.reduce((acc, user) => {
    // Get month name (e.g., "Jan", "Feb") and year
    const month = user.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlySignups).map(([month, total]) => ({
    month,
    total,
  }));
  
  // A more robust sort might be needed for chronological order if data spans years, but this is good for now.

  return { userCount, courseCount, chartData };
}

export default async function AdminDashboardPage() {
  const { userCount, courseCount, chartData } = await getDashboardData();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم الرئيسية</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <UserChart data={chartData} />
        </div>

        {/* Stat Cards */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  );
}