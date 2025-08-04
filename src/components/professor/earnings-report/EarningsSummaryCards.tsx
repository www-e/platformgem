// src/components/professor/earnings-report/EarningsSummaryCards.tsx
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  BarChart3
} from "lucide-react";
import { StatsCards } from "@/components/shared/StatsCards";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/earnings-utils";
import type { EarningsData } from "@/hooks/useEarningsReport";

interface EarningsSummaryCardsProps {
  earningsData: EarningsData;
}

export function EarningsSummaryCards({ earningsData }: EarningsSummaryCardsProps) {
  const growthIndicator = earningsData.earningsGrowth >= 0 
    ? `+${earningsData.earningsGrowth.toFixed(1)}% من الشهر الماضي`
    : `${earningsData.earningsGrowth.toFixed(1)}% من الشهر الماضي`;

  const statsData = [
    {
      id: 'total-earnings',
      title: 'إجمالي الأرباح',
      value: formatCurrency(earningsData.totalEarnings),
      subtitle: growthIndicator,
      icon: DollarSign,
      gradient: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      titleColor: 'text-green-800',
      valueColor: 'text-green-700',
      subtitleColor: earningsData.earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600',
      iconColor: 'text-green-600'
    },
    {
      id: 'monthly-earnings',
      title: 'أرباح الشهر',
      value: formatCurrency(earningsData.monthlyEarnings),
      subtitle: formatMonthYear(new Date()),
      icon: Calendar,
      gradient: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200',
      titleColor: 'text-blue-800',
      valueColor: 'text-blue-700',
      subtitleColor: 'text-blue-700',
      iconColor: 'text-blue-600'
    },
    {
      id: 'daily-earnings',
      title: 'أرباح اليوم',
      value: formatCurrency(earningsData.dailyEarnings),
      subtitle: formatDate(new Date()),
      icon: BarChart3,
      gradient: 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200',
      titleColor: 'text-purple-800',
      valueColor: 'text-purple-700',
      subtitleColor: 'text-purple-700',
      iconColor: 'text-purple-600'
    },
    {
      id: 'pending-payouts',
      title: 'في انتظار الدفع',
      value: formatCurrency(earningsData.pendingPayouts),
      subtitle: `الدفع في ${formatDate(earningsData.nextPayoutDate)}`,
      icon: CreditCard,
      gradient: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
      titleColor: 'text-orange-800',
      valueColor: 'text-orange-700',
      subtitleColor: 'text-orange-700',
      iconColor: 'text-orange-600'
    }
  ];

  return <StatsCards stats={statsData} gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" />;
}