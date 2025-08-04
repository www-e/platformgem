// src/components/professor/course-analytics/BestWorstLessonsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, MessageCircle } from 'lucide-react';
import { formatWatchTime } from '@/lib/course-analytics-utils';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface BestWorstLessonsCardsProps {
  courseData: CourseAnalytics;
}

export function BestWorstLessonsCards({ courseData }: BestWorstLessonsCardsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            أفضل درس أداءً
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.mostWatchedLesson ? (
            <div className="space-y-4">
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h3 className="font-semibold text-green-800 mb-2">
                  {courseData.mostWatchedLesson.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">وقت المشاهدة</p>
                    <p className="font-medium">
                      {formatWatchTime(courseData.mostWatchedLesson.watchTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">معدل الإكمال</p>
                    <p className="font-medium">
                      {courseData.mostWatchedLesson.completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>💡 هذا الدرس يحقق أفضل تفاعل من الطلاب. فكر في تطبيق نفس الأسلوب في دروس أخرى.</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">لا توجد بيانات كافية</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-red-600" />
            درس يحتاج تحسين
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courseData.leastWatchedLesson ? (
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h3 className="font-semibold text-red-800 mb-2">
                  {courseData.leastWatchedLesson.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">وقت المشاهدة</p>
                    <p className="font-medium">
                      {formatWatchTime(courseData.leastWatchedLesson.watchTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">معدل الإكمال</p>
                    <p className="font-medium">
                      {courseData.leastWatchedLesson.completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>⚠️ هذا الدرس يحتاج إلى مراجعة. فكر في تحسين المحتوى أو طريقة العرض.</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">لا توجد بيانات كافية</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}