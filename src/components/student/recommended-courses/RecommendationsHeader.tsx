// src/components/student/recommended-courses/RecommendationsHeader.tsx
import { Sparkles } from 'lucide-react';

export function RecommendationsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          الدورات المقترحة لك
        </h2>
        <p className="text-muted-foreground">
          دورات مختارة خصيصاً بناءً على اهتماماتك وتقدمك
        </p>
      </div>
    </div>
  );
}