// src/components/professor/course-analytics/OverviewCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Clock, TrendingUp } from 'lucide-react';
import { formatWatchTime } from '@/lib/course-analytics-utils';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface OverviewCardsProps {
  courseData: CourseAnalytics;
}

export function OverviewCards({ courseData }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courseData.totalEnrollments}</div>
          <p className="text-xs text-muted-foreground">
            {courseData.activeStudents} نشط
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courseData.completionRate.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-1 mt-2">
            <div 
              className="bg-primary h-1 rounded-full" 
              style={{ width: `${courseData.completionRate}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي وقت المشاهدة</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatWatchTime(courseData.totalWatchTime)}</div>
          <p className="text-xs text-muted-foreground">
            متوسط {formatWatchTime(courseData.averageWatchTime)} لكل ملتحق
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{courseData.averageProgress.toFixed(1)}%</div>
          <div className="w-full bg-muted rounded-full h-1 mt-2">
            <div 
              className="bg-primary h-1 rounded-full" 
              style={{ width: `${courseData.averageProgress}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}