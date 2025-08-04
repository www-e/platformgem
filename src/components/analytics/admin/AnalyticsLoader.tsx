// src/components/analytics/admin/AnalyticsLoader.tsx

import { Card, CardHeader } from '@/components/ui/card';

/**
 * Renders a skeleton loading indicator for the Admin Analytics dashboard.
 */
export function AnalyticsLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-muted rounded w-16"></div>
          <div className="h-9 bg-muted rounded w-16"></div>
          <div className="h-9 bg-muted rounded w-16"></div>
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full mt-1"></div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-md w-full grid grid-cols-5 p-1 gap-1">
          <div className="h-full bg-muted-foreground/10 rounded-sm col-span-1"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-12 bg-muted rounded w-full"></div>
                ))}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-12 bg-muted rounded w-full"></div>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}