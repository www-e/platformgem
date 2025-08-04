// src/components/course/course-catalog/ErrorState.tsx
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        عذراً، حدث خطأ في تحميل الدورات
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline">
        إعادة المحاولة
      </Button>
    </div>
  );
}