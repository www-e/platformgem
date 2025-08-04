// src/components/admin/revenue-analytics/RevenueSummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  BarChart3
} from "lucide-react";
import { formatCurrency, formatDate, formatMonthYear, calculateAverageOrderValue } from "@/lib/revenue-analytics-utils";
import type { RevenueData } from "@/hooks/useRevenueAnalytics";

interface RevenueSummaryCardsProps {
  revenueData: RevenueData;
}

export function RevenueSummaryCards({ revenueData }: RevenueSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(revenueData.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {revenueData.revenueGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs ${revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(revenueData.revenueGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(revenueData.monthlyRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatMonthYear()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إيرادات اليوم</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(revenueData.dailyRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(new Date())}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط الطلب</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {revenueData.recentPayments.length > 0 
              ? formatCurrency(calculateAverageOrderValue(revenueData.recentPayments))
              : '0 ج.م'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            قيمة الطلب الواحد
          </p>
        </CardContent>
      </Card>
    </div>
  );
}