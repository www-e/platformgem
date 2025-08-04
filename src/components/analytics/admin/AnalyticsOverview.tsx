// src/components/analytics/admin/AnalyticsOverview.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, DollarSign, Target, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { PlatformAnalytics } from '@/hooks/useAdminAnalytics';

interface AnalyticsOverviewProps {
  overview: PlatformAnalytics['overview'];
  revenueStats: PlatformAnalytics['revenueStats'];
  courseStats: PlatformAnalytics['courseStats'];
}

/**
 * Renders the grid of four main overview statistic cards.
 */
export function AnalyticsOverview({
  overview,
  revenueStats,
  courseStats,
}: AnalyticsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            {overview.activeUsers} نشط
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
          <BookOpen className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalCourses}</div>
          <p className="text-xs text-muted-foreground">
            {overview.publishedCourses} منشورة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overview.totalEnrollments}</div>
          <p className="text-xs text-muted-foreground">
            {courseStats.averageCompletionRate.toFixed(1)}% معدل الإكمال
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(overview.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(revenueStats.monthlyRevenue)} هذا الشهر
          </p>
        </CardContent>
      </Card>
    </div>
  );
}