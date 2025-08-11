// src/components/professor/student-engagement/EngagementOverview.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, Target, BarChart3 } from 'lucide-react';
import { formatDuration, getEngagementColor, getEngagementBadge } from '@/lib/engagement-utils';
import type { EngagementData } from '@/hooks/useStudentEngagement';

interface EngagementOverviewProps {
  data: EngagementData;
}

export function EngagementOverview({ data }: EngagementOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الملتحقين النشطون</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{data.totalActiveStudents}</div>
          <p className="text-xs text-muted-foreground">
            من إجمالي الملتحقين المسجلين
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط وقت المشاهدة</CardTitle>
          <Clock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatDuration(data.averageWatchTime)}
          </div>
          <p className="text-xs text-muted-foreground">
            لكل ملتحق يومياً
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
          <Target className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {data.completionRate.toFixed(1)}%
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${data.completionRate}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">نقاط التفاعل</CardTitle>
          <BarChart3 className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getEngagementColor(data.engagementScore)}`}>
            {data.engagementScore.toFixed(0)}
          </div>
          {getEngagementBadge(data.engagementScore)}
        </CardContent>
      </Card>
    </div>
  );
}