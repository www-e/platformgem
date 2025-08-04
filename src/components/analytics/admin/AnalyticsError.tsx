// src/components/analytics/admin/AnalyticsError.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

interface AnalyticsErrorProps {
  error: string;
  onRetry: () => void;
}

/**
 * Renders an error message card for the Admin Analytics dashboard.
 */
export function AnalyticsError({ error, onRetry }: AnalyticsErrorProps) {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">خطأ في تحميل الإحصائيات</h3>
        <p className="text-muted-foreground mb-4">
          {error || 'حدث خطأ أثناء تحميل بيانات الإحصائيات'}
        </p>
        <Button onClick={onRetry}>إعادة المحاولة</Button>
      </CardContent>
    </Card>
  );
}