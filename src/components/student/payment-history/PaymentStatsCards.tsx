// src/components/student/payment-history/PaymentStatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign,
  CheckCircle,
  BarChart3,
  XCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/payment-utils';
import type { PaymentStats } from '@/hooks/usePaymentHistory';

interface PaymentStatsCardsProps {
  stats: PaymentStats;
}

export function PaymentStatsCards({ stats }: PaymentStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground">
            على {stats.totalTransactions} معاملة
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المعاملات الناجحة</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.successfulPayments}</div>
          <p className="text-xs text-muted-foreground">
            من أصل {stats.totalTransactions} معاملة
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
          <BarChart3 className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(stats.averageOrderValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            متوسط الإنفاق لكل دورة
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">المعاملات الفاشلة</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.failedPayments}</div>
          <p className="text-xs text-muted-foreground">
            معاملة فاشلة
          </p>
        </CardContent>
      </Card>
    </div>
  );
}