// src/components/student/PaymentHistory.tsx
'use client';

import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { PaymentStatsCards } from './payment-history/PaymentStatsCards';
import { PaymentFilters } from './payment-history/PaymentFilters';
import { TransactionsList } from './payment-history/TransactionsList';
import { MonthlySpendingCard } from './payment-history/MonthlySpendingCard';
import { PaymentMethodsCard } from './payment-history/PaymentMethodsCard';
import { LoadingState } from './payment-history/LoadingState';

export function PaymentHistory() {
  const {
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredTransactions,
    exportPaymentHistory
  } = usePaymentHistory();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {stats && <PaymentStatsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PaymentFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            onExport={exportPaymentHistory}
          />

          <TransactionsList transactions={filteredTransactions} />
        </div>

        <div className="space-y-6">
          {stats && <MonthlySpendingCard monthlySpending={stats.monthlySpending} />}
          {stats && <PaymentMethodsCard paymentMethods={stats.paymentMethods} />}
        </div>
      </div>
    </div>
  );
}