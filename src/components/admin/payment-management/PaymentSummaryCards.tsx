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
      title: 'Total Payments',
      value: summary.total,
      subtitle: 'All transactions',
      icon: CreditCard,
      cardClassName: 'border-l-4 border-l-blue-500'
    },
    {
      id: 'completed-payments',
      title: 'Completed',
      value: summary.completed,
      subtitle: `${summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : 0}% of total`,
      icon: CheckCircle,
      cardClassName: 'border-l-4 border-l-green-500'
    },
    {
      id: 'pending-payments',
      title: 'Pending',
      value: summary.pending,
      subtitle: 'Need follow-up',
      icon: Clock,
      cardClassName: 'border-l-4 border-l-yellow-500'
    },
    {
      id: 'failed-payments',
      title: 'Failed',
      value: summary.failed,
      subtitle: `${summary.cancelled} cancelled`,
      icon: XCircle,
      cardClassName: 'border-l-4 border-l-red-500'
    },
    {
      id: 'total-revenue',
      title: 'Total Revenue',
      value: formatCurrency(summary.totalRevenue),
      subtitle: 'From completed payments',
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