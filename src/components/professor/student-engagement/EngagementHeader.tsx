// src/components/professor/student-engagement/EngagementHeader.tsx
import { Activity } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CourseEngagement } from '@/hooks/useStudentEngagement';

interface EngagementHeaderProps {
  selectedPeriod: 'week' | 'month' | 'quarter';
  setSelectedPeriod: (period: 'week' | 'month' | 'quarter') => void;
  selectedCourse: string;
  setSelectedCourse: (course: string) => void;
  courseEngagement: CourseEngagement[];
}

export function EngagementHeader({
  selectedPeriod,
  setSelectedPeriod,
  selectedCourse,
  setSelectedCourse,
  courseEngagement
}: EngagementHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          تفاعل الملتحقين
        </h2>
        <p className="text-muted-foreground">
          تتبع نشاط وتفاعل ملتحقينك مع المحتوى
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">أسبوع</SelectItem>
            <SelectItem value="month">شهر</SelectItem>
            <SelectItem value="quarter">ربع سنة</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="اختر الدورة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدورات</SelectItem>
            {courseEngagement.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}