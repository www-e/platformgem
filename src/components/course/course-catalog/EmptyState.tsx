// src/components/course/course-catalog/EmptyState.tsx
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        لا توجد دورات مطابقة للبحث
      </h3>
      <p className="text-gray-600 mb-4">
        جرب تغيير معايير البحث أو التصفية للعثور على دورات أخرى
      </p>
      <Button onClick={onClearFilters} variant="outline">
        إعادة تعيين الفلاتر
      </Button>
    </div>
  );
}