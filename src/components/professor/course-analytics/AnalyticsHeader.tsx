// src/components/professor/course-analytics/AnalyticsHeader.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourseAnalytics } from '@/hooks/useCourseAnalytics';

interface AnalyticsHeaderProps {
  analytics: CourseAnalytics[];
  selectedCourse: string;
  onCourseChange: (courseId: string) => void;
}

export function AnalyticsHeader({ analytics, selectedCourse, onCourseChange }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">تحليلات الدورات</h2>
        <p className="text-muted-foreground">
          تحليل مفصل لأداء دوراتك وتفاعل الملتحقين
        </p>
      </div>
      <Select value={selectedCourse} onValueChange={onCourseChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="اختر دورة" />
        </SelectTrigger>
        <SelectContent>
          {analytics.map((course) => (
            <SelectItem key={course.courseId} value={course.courseId}>
              {course.courseName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}