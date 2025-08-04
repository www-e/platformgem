// src/components/analytics/AdminAnalytics.tsx
"use client";

import { useState } from 'react';
import { useAdminAnalytics, TimeRange } from '@/hooks/useAdminAnalytics';
import { AnalyticsLoader } from './admin/AnalyticsLoader';
import { AnalyticsError } from './admin/AnalyticsError';
import { AnalyticsHeader } from './admin/AnalyticsHeader';
import { AnalyticsOverview } from './admin/AnalyticsOverview';
import { DetailedAnalyticsTabs } from './admin/DetailedAnalyticsTabs';

/**
 * The main container component for the Admin Analytics dashboard.
 * It orchestrates data fetching and state handling via the useAdminAnalytics hook,
 * and renders the appropriate UI components for loading, error, and success states.
 */
export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const { analytics, loading, error } = useAdminAnalytics(timeRange);

  // The retry function simply re-triggers the fetch by changing the state
  const handleRetry = () => {
    // A simple way to force re-fetch is to set the same time range again,
    // though the hook's dependency array will handle it.
    // A more robust solution might involve a dedicated retry function in the hook.
    window.location.reload();
  };

  if (loading) {
    return <AnalyticsLoader />;
  }

  if (error || !analytics) {
    return <AnalyticsError error={error || 'No data returned'} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader timeRange={timeRange} setTimeRange={setTimeRange} />
      <AnalyticsOverview
        overview={analytics.overview}
        revenueStats={analytics.revenueStats}
        courseStats={analytics.courseStats}
      />
      <DetailedAnalyticsTabs analytics={analytics} />
    </div>
  );
}