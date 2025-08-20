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
      title="No courses match your filters"
      description="Try changing your filters to find courses that suit you"
      actionText="Reset Filters"
      onAction={onResetFilters}
    />
  );
}
