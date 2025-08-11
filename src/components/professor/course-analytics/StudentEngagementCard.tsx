// src/components/professor/course-analytics/StudentEngagementCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { formatWatchTime, getEngagementColor, formatDateArabic } from '@/lib/course-analytics-utils';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface StudentEngagementCardProps {
  courseData: CourseAnalytics;
}

export function StudentEngagementCard({ courseData }: StudentEngagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          تفاعل الملتحقين
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseData.studentEngagement.slice(0, 5).map((student) => (
            <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{student.studentName}</p>
                  <p className="text-sm text-muted-foreground">
                    آخر نشاط: {formatDateArabic(student.lastActivity)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{student.progress}%</Badge>
                  <span className={`text-sm font-medium ${getEngagementColor(student.engagementScore)}`}>
                    {student.engagementScore}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatWatchTime(student.watchTime)} مشاهدة
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}