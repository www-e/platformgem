// src/components/analytics/professor/OverviewCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Clock, 
  CheckCircle,
  Activity
} from 'lucide-react';
import { formatTime } from '@/lib/analytics-utils';
import type { CourseAnalytics } from '@/hooks/useProfessorAnalytics';

interface OverviewCardsProps {
  analytics: CourseAnalytics;
}

export function OverviewCards({ analytics }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.overview.totalStudents}</div>
          <p className="text-xs text-muted-foreground">
            {analytics.metrics.activeStudentsLast7Days} نشط خلال 7 أيام
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.overview.overallCompletionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.metrics.completedLessonsCount} درس مكتمل
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
          <Activity className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analytics.overview.engagementRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {analytics.overview.recentActivity} نشاط حديث
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">وقت المشاهدة</CardTitle>
          <Clock className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatTime(analytics.metrics.totalWatchTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatTime(analytics.metrics.averageWatchTimePerStudent)} متوسط لكل طالب
          </p>
        </CardContent>
      </Card>
    </div>
  );
}