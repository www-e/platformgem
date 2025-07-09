// src/app/admin/page.tsx

import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen } from "lucide-react";

async function getStats() {
  const userCount = await prisma.user.count({ where: { isAdmin: false } });
  const courseCount = await prisma.course.count();
  return { userCount, courseCount };
}

export default async function AdminDashboardPage() {
  const { userCount, courseCount } = await getStats();

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Students</CardTitle>
            <Users className="h-5 w-5 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
            <p className="text-xs text-gray-400">Registered students on the platform</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Courses</CardTitle>
            <BookOpen className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courseCount}</div>
            <p className="text-xs text-gray-400">Courses available for enrollment</p>
          </CardContent>
        </Card>
        
        {/* Additional stat cards can be added here in the future */}

      </div>
    </div>
  );
}