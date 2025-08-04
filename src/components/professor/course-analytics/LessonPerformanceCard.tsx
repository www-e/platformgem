// src/components/professor/course-analytics/LessonPerformanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';
import { formatWatchTime, getEngagementBadge } from '@/lib/course-analytics-utils';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface LessonPerformanceCardProps {
  courseData: CourseAnalytics;
}

export function LessonPerformanceCard({ courseData }: LessonPerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          أداء الدروس
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseData.lessonAnalytics.slice(0, 5).map((lesson) => (
            <div key={lesson.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{lesson.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {lesson.completionRate.toFixed(1)}% إكمال
                  </Badge>
                  {getEngagementBadge(lesson.averageEngagement)}
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${lesson.completionRate}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>وقت المشاهدة: {formatWatchTime(lesson.watchTime)}</span>
                <span>معدل التسرب: {lesson.dropOffRate.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}