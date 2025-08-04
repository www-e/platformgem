// src/components/course/course-content/CourseProgressCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface CourseProgressCardProps {
  overallProgress: number;
  completedCount: number;
  totalLessons: number;
  totalWatchedTime: number;
  totalDuration: number;
}

export function CourseProgressCard({
  overallProgress,
  completedCount,
  totalLessons,
  totalWatchedTime,
  totalDuration
}: CourseProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          تقدمك في الدورة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>التقدم الإجمالي</span>
            <span>{completedCount} من {totalLessons} دروس</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${overallProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>وقت المشاهدة: {Math.floor(totalWatchedTime / 60)} دقيقة</span>
            <span>المدة الإجمالية: {Math.floor(totalDuration / 60)} دقيقة</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}