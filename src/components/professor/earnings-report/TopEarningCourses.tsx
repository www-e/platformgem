// src/components/professor/earnings-report/TopEarningCourses.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Target } from "lucide-react";
import { formatCurrency } from "@/lib/earnings-utils";
import type { TopEarningCourse } from "@/hooks/useEarningsReport";

interface TopEarningCoursesProps {
  courses: TopEarningCourse[];
}

export function TopEarningCourses({ courses }: TopEarningCoursesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          أعلى الدورات ربحاً
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-black font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-medium truncate">{course.title}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students} ملتحق
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {course.conversionRate.toFixed(1)}% تحويل
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrency(course.earnings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(course.averagePrice)} متوسط السعر
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}