// src/components/admin/revenue-analytics/RevenueSummaryCards.tsx
import {
  DollarSign,
  Calendar,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { StatsCards } from "@/components/shared/StatsCards";
import {
  formatCurrency,
  formatDate,
  formatMonthYear,
  calculateAverageOrderValue,
} from "@/lib/revenue-analytics-utils";
import type { RevenueData } from "@/hooks/useRevenueAnalytics";

interface RevenueSummaryCardsProps {
  revenueData: RevenueData;
}

export function RevenueSummaryCards({ revenueData }: RevenueSummaryCardsProps) {
  const growthIndicator =
    revenueData.revenueGrowth >= 0
      ? `+${revenueData.revenueGrowth.toFixed(1)}% من الشهر الماضي`
      : `${revenueData.revenueGrowth.toFixed(1)}% من الشهر الماضي`;

  const statsData = [
    {
      id: "total-revenue",
      title: "إجمالي الإيرادات",
      value: formatCurrency(revenueData.totalRevenue),
      subtitle: growthIndicator,
      icon: DollarSign,
      subtitleColor:
        revenueData.revenueGrowth >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      id: "monthly-revenue",
      title: "إيرادات الشهر",
      value: formatCurrency(revenueData.monthlyRevenue),
      subtitle: formatMonthYear(),
      icon: Calendar,
    },
    {
      id: "daily-revenue",
      title: "إيرادات اليوم",
      value: formatCurrency(revenueData.dailyRevenue),
      subtitle: formatDate(new Date()),
      icon: BarChart3,
    },
    {
      id: "average-order",
      title: "متوسط الطلب",
      value:
        revenueData.recentPayments.length > 0
          ? formatCurrency(
              calculateAverageOrderValue(revenueData.recentPayments.map(p => Number(p.amount)))
            )
          : "0 ج.م",
      subtitle: "قيمة الطلب الواحد",
      icon: CreditCard,
    },
  ];

  return <StatsCards stats={statsData} />;
}
