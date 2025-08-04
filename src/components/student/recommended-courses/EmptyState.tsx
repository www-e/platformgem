// src/components/student/recommended-courses/EmptyState.tsx
import { Sparkles } from "lucide-react";
import { EmptyState as SharedEmptyState } from "@/components/shared/EmptyState";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <SharedEmptyState
      icon={Sparkles}
      title="لا توجد دورات مطابقة للمرشحات"
      description="جرب تغيير المرشحات للعثور على دورات مناسبة لك"
      actionText="إعادة تعيين المرشحات"
      onAction={onResetFilters}
    />
  );
}
