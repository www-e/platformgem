// src/components/professor/course-analytics/WeeklyPerformanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  formatWatchTime,
  calculatePercentage,
} from "@/lib/course-analytics-utils";
import type { CourseAnalytics } from "@/hooks/useCourseAnalytics";

interface WeeklyPerformanceCardProps {
  courseData: CourseAnalytics;
}

export function WeeklyPerformanceCard({
  courseData,
}: WeeklyPerformanceCardProps) {
  const maxEnrollments = Math.max(
    ...courseData.weeklyStats.map((w) => w.enrollments)
  );
  const maxWatchTime = Math.max(
    ...courseData.weeklyStats.map((w) => w.watchTime)
  );
  const maxCompletions = Math.max(
    ...courseData.weeklyStats.map((w) => w.completions)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          الأداء الأسبوعي
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courseData.weeklyStats.map((week) => (
            <div key={week.week} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{week.week}</span>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{week.enrollments} تسجيل</span>
                  <span>{formatWatchTime(week.watchTime)} مشاهدة</span>
                  <span>{week.completions} إكمال</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">التسجيلات</div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          week.enrollments,
                          maxEnrollments
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">المشاهدة</div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          week.watchTime,
                          maxWatchTime
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">الإكمال</div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-purple-500 h-1 rounded-full"
                      style={{
                        width: `${calculatePercentage(
                          week.completions,
                          maxCompletions
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
