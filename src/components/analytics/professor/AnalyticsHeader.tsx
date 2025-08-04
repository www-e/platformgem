// src/components/analytics/professor/AnalyticsHeader.tsx
import { Badge } from '@/components/ui/badge';
import { getCurrentDateArabic } from '@/lib/analytics-utils';

interface AnalyticsHeaderProps {
  courseTitle: string;
}

export function AnalyticsHeader({ courseTitle }: AnalyticsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">{courseTitle}</h2>
        <p className="text-muted-foreground">إحصائيات مفصلة للدورة</p>
      </div>
      <Badge variant="outline" className="text-sm">
        آخر تحديث: {getCurrentDateArabic()}
      </Badge>
    </div>
  );
}