// src/components/admin/AdminPaymentManagement.tsx
'use client';

import { useState } from 'react';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { PaymentSummaryCards } from './payment-management/PaymentSummaryCards';
import { PaymentFilters } from './payment-management/PaymentFilters';
import { PaymentList } from './payment-management/PaymentList';
import { PaymentPagination } from './payment-management/PaymentPagination';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';

/**
 * Main container component for the payment management dashboard.
 * It uses the useAdminPayments hook to manage all state and logic,
 * and composes the UI from modular sub-components.
 */
export default function AdminPaymentManagement() {
  const {
    payments,
    summary,
    isLoading,
    pagination,
    filters,
    handlePaymentAction,
    exportPayments,
    refresh,
  } = useAdminPayments();

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedPaymentId(null);
  };

  return (
    <div className="space-y-6">
      <PaymentSummaryCards summary={summary} isLoading={isLoading} />
      <PaymentFilters
        filters={filters}
        onRefresh={refresh}
        onExport={exportPayments}
      />
      <PaymentList
        payments={payments}
        totalPayments={summary?.total || 0}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onAction={handlePaymentAction}
      />
      <PaymentPagination pagination={pagination} />

      {/* The modal remains controlled by the main container component */}
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}