// src/components/professor/EarningsReport.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Download, Wallet } from 'lucide-react';
import { useEarningsReport } from '@/hooks/useEarningsReport';
import { EarningsSummaryCards } from './earnings-report/EarningsSummaryCards';
import { TopEarningCourses } from './earnings-report/TopEarningCourses';
import { RecentTransactions } from './earnings-report/RecentTransactions';
import { MonthlyBreakdown } from './earnings-report/MonthlyBreakdown';
import { LoadingState } from './earnings-report/LoadingState';

export function EarningsReport() {
  const {
    earningsData,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    exportReport
  } = useEarningsReport();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!earningsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل بيانات الأرباح</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-green-600" />
            تقرير الأرباح
          </h2>
          <p className="text-muted-foreground">
            تتبع أرباحك ومبيعاتك بالتفصيل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={selectedPeriod === 'week' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              أسبوع
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              شهر
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('year')}
            >
              سنة
            </Button>
          </div>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Earnings Summary */}
      <EarningsSummaryCards earningsData={earningsData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Earning Courses */}
        <TopEarningCourses courses={earningsData.topEarningCourses} />

        {/* Recent Transactions */}
        <RecentTransactions transactions={earningsData.recentTransactions} />
      </div>

      {/* Monthly Breakdown */}
      <MonthlyBreakdown monthlyData={earningsData.monthlyBreakdown} />
    </div>
  );
}