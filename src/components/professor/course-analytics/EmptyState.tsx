// src/components/professor/course-analytics/EmptyState.tsx
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-courses' | 'no-selection';
}

export function EmptyState({ type }: EmptyStateProps) {
  if (type === 'no-courses') {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">لا توجد دورات لعرض التحليلات</p>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">اختر دورة لعرض التحليلات</p>
    </div>
  );
}