// src/components/admin/revenue-analytics/TopCoursesByRevenue.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/revenue-analytics-utils";
import type { TopCourse } from "@/hooks/useRevenueAnalytics";

interface TopCoursesByRevenueProps {
  courses: TopCourse[];
}

export function TopCoursesByRevenue({ courses }: TopCoursesByRevenueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          أعلى الدورات إيراداً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium truncate">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.professor} • {course.enrollments} تسجيل
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {formatCurrency(course.revenue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}