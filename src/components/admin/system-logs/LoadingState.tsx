// src/components/admin/system-logs/LoadingState.tsx
import { LoadingState as SharedLoadingState } from '@/components/shared/LoadingState';

export function LoadingState() {
  return <SharedLoadingState cardCount={8} />;
}