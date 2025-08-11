// src/components/analytics/professor/OverviewTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PieChart,
  Award
} from 'lucide-react';
import { formatTime } from '@/lib/analytics-utils';
import type { CourseAnalytics } from '@/hooks/useProfessorAnalytics';

interface OverviewTabProps {
  analytics: CourseAnalytics;
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            ملخص الدورة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span>إجمالي الدروس</span>
            <Badge variant="outline">{analytics.overview.totalLessons}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>المدة الإجمالية</span>
            <Badge variant="outline">{formatTime(analytics.overview.totalDuration)}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>إجمالي الملتحقين</span>
            <Badge variant="outline">{analytics.overview.totalStudents}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span>الملتحقين النشطون</span>
            <Badge variant="outline">{analytics.metrics.activeStudentsLast7Days}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            مؤشرات الأداء
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>معدل الإكمال العام</span>
              <span className="font-semibold">
                {analytics.overview.overallCompletionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${analytics.overview.overallCompletionRate}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>معدل التفاعل</span>
              <span className="font-semibold">
                {analytics.overview.engagementRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(analytics.overview.engagementRate, 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground mb-1">
              متوسط وقت المشاهدة لكل ملتحق
            </div>
            <div className="text-lg font-semibold">
              {formatTime(analytics.metrics.averageWatchTimePerStudent)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}