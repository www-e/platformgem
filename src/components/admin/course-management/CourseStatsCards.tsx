// src/components/admin/course-management/CourseStatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/course-management-utils';
import type { CourseStats } from '@/hooks/useCourseManagement';

interface CourseStatsCardsProps {
  stats: CourseStats;
}

export function CourseStatsCards({ stats }: CourseStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">إجمالي الدورات</CardTitle>
          <BookOpen className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
          <p className="text-xs text-gray-500">
            {stats.publishedCourses} منشورة • {stats.draftCourses} مسودة
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">إجمالي التسجيلات</CardTitle>
          <Users className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEnrollments}</div>
          <p className="text-xs text-gray-500">
            {stats.totalCourses > 0 ? (stats.totalEnrollments / stats.totalCourses).toFixed(1) : 0} متوسط لكل دورة
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(stats.totalRevenue)}
          </div>
          <p className="text-xs text-gray-500">
            من جميع الدورات
          </p>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">متوسط السعر</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(stats.averagePrice)}
          </div>
          <p className="text-xs text-gray-500">
            متوسط سعر الدورة
          </p>
        </CardContent>
      </Card>
    </div>
  );
}