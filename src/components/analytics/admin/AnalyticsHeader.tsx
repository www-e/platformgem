// src/components/analytics/admin/AnalyticsHeader.tsx

import { Button } from '@/components/ui/button';
import { TimeRange } from '@/hooks/useAdminAnalytics';

interface AnalyticsHeaderProps {
  timeRange: TimeRange;
  setTimeRange: (range: TimeRange) => void;
}

/**
 * Renders the header for the analytics page, including title and time range controls.
 */
export function AnalyticsHeader({
  timeRange,
  setTimeRange,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">إحصائيات المنصة</h2>
        <p className="text-muted-foreground">نظرة شاملة على أداء المنصة</p>
      </div>
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
          </Button>
        ))}
      </div>
    </div>
  );
}