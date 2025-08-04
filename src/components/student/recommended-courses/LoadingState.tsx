// src/components/student/recommended-courses/LoadingState.tsx
import { LoadingState as SharedLoadingState } from '@/components/shared/LoadingState';

export function LoadingState() {
  return (
    <SharedLoadingState 
      cardCount={6} 
      gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    />
  );
}