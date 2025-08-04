// src/components/course/course-catalog/EmptyState.tsx
import { BookOpen } from 'lucide-react';
import { EmptyState as SharedEmptyState } from '@/components/shared/EmptyState';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <SharedEmptyState
      icon={BookOpen}
      title="لا توجد دورات مطابقة للبحث"
      description="جرب تغيير معايير البحث أو التصفية للعثور على دورات أخرى"
      actionText="إعادة تعيين الفلاتر"
      onAction={onClearFilters}
    />
  );
}