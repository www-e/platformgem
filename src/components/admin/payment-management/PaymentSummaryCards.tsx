// src/components/admin/payment-management/PaymentSummaryCards.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { PaymentSummary } from '@/hooks/useAdminPayments';
import { formatCurrency } from '@/lib/formatters';

interface PaymentSummaryCardsProps {
  summary: PaymentSummary | null;
  isLoading: boolean;
}

/**
 * Displays the grid of summary cards for the payment management dashboard.
 * Handles its own loading skeleton state.
 */
export function PaymentSummaryCards({
  summary,
  isLoading,
}: PaymentSummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-full mt-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.total}</div>
          <p className="text-xs text-muted-foreground">جميع المعاملات</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.completed}</div>
          <p className="text-xs text-muted-foreground">
            {summary.total > 0
              ? ((summary.completed / summary.total) * 100).toFixed(1)
              : 0}
            % من المجموع
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معلقة</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.pending}</div>
          <p className="text-xs text-muted-foreground">تحتاج متابعة</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">فاشلة</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.failed}</div>
          <p className="text-xs text-muted-foreground">
            {summary.cancelled} ملغية
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">من المدفوعات المكتملة</p>
        </CardContent>
      </Card>
    </div>
  );
}