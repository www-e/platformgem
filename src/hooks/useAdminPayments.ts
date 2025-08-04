// src/hooks/useAdminPayments.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Define the types co-located with the hook for clarity
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  paymobOrderId?: string;
  paymobTransactionId?: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    professor: {
      name: string;
    };
  };
  lastWebhook?: {
    id: string;
    processedAt: string;
    processingAttempts: number;
    lastError?: string;
  };
}

export interface PaymentSummary {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface UseAdminPaymentsReturn {
  payments: Payment[];
  summary: PaymentSummary | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
  };
  filters: {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    dateFrom: string;
    setDateFrom: (date: string) => void;
    dateTo: string;
    setDateTo: (date: string) => void;
  };
  handlePaymentAction: (
    paymentId: string,
    action: string,
    additionalData?: any
  ) => Promise<void>;
  exportPayments: () => Promise<void>;
  refresh: () => void;
}

/**
 * A comprehensive hook to manage the state and logic for the Admin Payment Management dashboard.
 */
export function useAdminPayments(): UseAdminPaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // A simple state to trigger refetch
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10', // Consistent limit
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!response.ok) throw new Error('فشل في تحميل المدفوعات من الخادم');

      const result = await response.json();
      if (result.success) {
        setPayments(result.data.payments);
        setSummary(result.data.summary);
        setTotalPages(result.data.pagination.pages);
      } else {
        throw new Error(result.error || 'فشل في تحميل المدفوعات');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm, dateFrom, dateTo, refetchTrigger]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePaymentAction = async (
    paymentId: string,
    action: string,
    additionalData?: any
  ) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...additionalData }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success('تم تحديث المدفوعة بنجاح');
        fetchPayments(); // Refetch data after action
      } else {
        toast.error(result.error?.message || 'فشل في تحديث المدفوعة');
      }
    } catch (err) {
      console.error('Payment action failed:', err);
      toast.error('حدث خطأ في العملية');
    }
  };

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(
        `/api/admin/payments/export?${params.toString()}`
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-export-${new Date()
          .toISOString()
          .split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success('تم تصدير البيانات بنجاح');
      } else {
        toast.error('فشل في تصدير البيانات');
      }
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('حدث خطأ في التصدير');
    }
  };

  const refresh = () => setRefetchTrigger((c) => c + 1);

  return {
    payments,
    summary,
    isLoading,
    error,
    pagination: {
      currentPage,
      totalPages,
      setCurrentPage,
    },
    filters: {
      searchTerm,
      setSearchTerm,
      statusFilter,
      setStatusFilter,
      dateFrom,
      setDateFrom,
      dateTo,
      setDateTo,
    },
    handlePaymentAction,
    exportPayments,
    refresh,
  };
}