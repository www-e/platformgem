// src/components/professor/earnings-report/EarningsSummaryCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  BarChart3
} from "lucide-react";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/earnings-utils";
import type { EarningsData } from "@/hooks/useEarningsReport";

interface EarningsSummaryCardsProps {
  earningsData: EarningsData;
}

export function EarningsSummaryCards({ earningsData }: EarningsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">إجمالي الأرباح</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(earningsData.totalEarnings)}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {earningsData.earningsGrowth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`text-xs ${earningsData.earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(earningsData.earningsGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-green-700">من الشهر الماضي</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">أرباح الشهر</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(earningsData.monthlyEarnings)}
          </div>
          <p className="text-xs text-blue-700">
            {formatMonthYear(new Date())}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">أرباح اليوم</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(earningsData.dailyEarnings)}
          </div>
          <p className="text-xs text-purple-700">
            {formatDate(new Date())}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">في انتظار الدفع</CardTitle>
          <CreditCard className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">
            {formatCurrency(earningsData.pendingPayouts)}
          </div>
          <p className="text-xs text-orange-700">
            الدفع في {formatDate(earningsData.nextPayoutDate)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}