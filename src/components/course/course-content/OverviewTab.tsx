// src/components/course/course-content/OverviewTab.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, BookOpen, Clock, CheckCircle } from "lucide-react";
import type { Lesson, Course } from "@/hooks/useCourseContent";

interface OverviewTabProps {
  course: Course;
  lessons: Lesson[];
  totalDuration: number;
}

export function OverviewTab({ course, lessons, totalDuration }: OverviewTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          نظرة عامة على الدورة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2">وصف الدورة</h4>
          <p className="text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">محتويات الدورة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">الدروس</span>
              </div>
              <p className="text-2xl font-bold">{lessons.length}</p>
              <p className="text-sm text-muted-foreground">درس تعليمي</p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-medium">المدة الإجمالية</span>
              </div>
              <p className="text-2xl font-bold">{Math.floor(totalDuration / 60)}</p>
              <p className="text-sm text-muted-foreground">دقيقة</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">ما ستتعلمه</h4>
          <ul className="space-y-2">
            {lessons.slice(0, 5).map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm">{lesson.title}</span>
              </li>
            ))}
            {lessons.length > 5 && (
              <li className="text-sm text-muted-foreground">
                و {lessons.length - 5} دروس أخرى...
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}