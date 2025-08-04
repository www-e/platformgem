// src/components/admin/payment-management/PaymentSummaryCards.tsx
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { StatsCards } from '@/components/shared/StatsCards';
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
  if (!summary) {
    return (
      <StatsCards 
        stats={[]} 
        isLoading={true} 
        loadingCardCount={5}
        gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
      />
    );
  }

  const statsData = [
    {
      id: 'total-payments',
      title: 'إجمالي المدفوعات',
      value: summary.total,
      subtitle: 'جميع المعاملات',
      icon: CreditCard,
      cardClassName: 'border-l-4 border-l-blue-500'
    },
    {
      id: 'completed-payments',
      title: 'مكتملة',
      value: summary.completed,
      subtitle: `${summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : 0}% من المجموع`,
      icon: CheckCircle,
      cardClassName: 'border-l-4 border-l-green-500'
    },
    {
      id: 'pending-payments',
      title: 'معلقة',
      value: summary.pending,
      subtitle: 'تحتاج متابعة',
      icon: Clock,
      cardClassName: 'border-l-4 border-l-yellow-500'
    },
    {
      id: 'failed-payments',
      title: 'فاشلة',
      value: summary.failed,
      subtitle: `${summary.cancelled} ملغية`,
      icon: XCircle,
      cardClassName: 'border-l-4 border-l-red-500'
    },
    {
      id: 'total-revenue',
      title: 'إجمالي الإيرادات',
      value: formatCurrency(summary.totalRevenue),
      subtitle: 'من المدفوعات المكتملة',
      icon: DollarSign,
      cardClassName: 'border-l-4 border-l-purple-500'
    }
  ];

  return (
    <StatsCards 
      stats={statsData} 
      isLoading={isLoading}
      gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-5"
    />
  );
}