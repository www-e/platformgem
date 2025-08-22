// src/components/admin/RevenueAnalytics.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useRevenueAnalytics } from "@/hooks/useRevenueAnalytics";
import { RevenueSummaryCards } from "./revenue-analytics/RevenueSummaryCards";
import { TopCoursesByRevenue } from "./revenue-analytics/TopCoursesByRevenue";
import { PaymentMethodsChart } from "./revenue-analytics/PaymentMethodsChart";
import { RecentPayments } from "./revenue-analytics/RecentPayments";
import { LoadingState } from "./revenue-analytics/LoadingState";

export function RevenueAnalytics() {
  const {
    revenueData,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    exportReport,
  } = useRevenueAnalytics();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!revenueData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load revenue data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track the platform&apos;s financial performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={selectedPeriod === "week" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod("week")}
            >
              Week
            </Button>
            <Button
              variant={selectedPeriod === "month" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod("month")}
            >
              Month
            </Button>
            <Button
              variant={selectedPeriod === "year" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod("year")}
            >
              Year
            </Button>
          </div>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <RevenueSummaryCards revenueData={revenueData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses by Revenue */}
        <TopCoursesByRevenue courses={revenueData.topCourses} />

        {/* Payment Methods */}
        <PaymentMethodsChart paymentMethods={revenueData.paymentMethods} />
      </div>

      {/* Recent Payments */}
      <RecentPayments payments={revenueData.recentPayments} />
    </div>
  );
}
