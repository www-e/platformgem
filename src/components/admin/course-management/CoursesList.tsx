// src/components/admin/course-management/CoursesList.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { CourseItem } from './CourseItem';
import type { CourseData } from '@/hooks/useCourseManagement';

interface CoursesListProps {
  courses: CourseData[];
  onCourseAction: (courseId: string, action: 'publish' | 'unpublish' | 'delete') => void;
}

export function CoursesList({ courses, onCourseAction }: CoursesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة الدورات ({courses.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <CourseItem
              key={course.id}
              course={course}
              onAction={onCourseAction}
            />
          ))}
          
          {courses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد نتائج مطابقة للبحث</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}