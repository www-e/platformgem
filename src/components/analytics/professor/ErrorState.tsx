// src/components/analytics/professor/ErrorState.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">خطأ في تحميل الإحصائيات</h3>
        <p className="text-muted-foreground mb-4">
          {error || 'حدث خطأ أثناء تحميل بيانات الإحصائيات'}
        </p>
        <Button onClick={onRetry}>
          إعادة المحاولة
        </Button>
      </CardContent>
    </Card>
  );
}