// src/components/student/recommended-courses/EmptyState.tsx
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">لا توجد دورات مطابقة للمرشحات</h3>
      <p className="text-muted-foreground mb-4">
        جرب تغيير المرشحات للعثور على دورات مناسبة لك
      </p>
      <Button variant="outline" onClick={onResetFilters}>
        إعادة تعيين المرشحات
      </Button>
    </div>
  );
}