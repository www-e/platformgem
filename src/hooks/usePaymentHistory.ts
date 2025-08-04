// src/hooks/usePaymentHistory.ts
"use client";

import { useState, useEffect, useMemo } from 'react';

interface PaymentTransaction {
  id: string;
  courseName: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
  paymobOrderId?: string;
  refundReason?: string;
}

interface PaymentStats {
  totalSpent: number;
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  averageOrderValue: number;
  monthlySpending: MonthlySpending[];
  paymentMethods: PaymentMethodStats[];
}

interface MonthlySpending {
  month: string;
  amount: number;
  transactions: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export function usePaymentHistory() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const [transactionsRes, statsRes] = await Promise.all([
        fetch('/api/student/payment-history'),
        fetch('/api/student/payment-stats')
      ]);
      
      const transactionsData = await transactionsRes.json();
      const statsData = await statsRes.json();
      
      setTransactions(transactionsData.transactions);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPaymentHistory = async () => {
    try {
      const response = await fetch('/api/student/export-payment-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusFilter,
          dateFilter,
          searchTerm
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-history-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export payment history:', error);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const transactionDate = new Date(transaction.createdAt);
        const now = new Date();
        
        switch (dateFilter) {
          case 'week':
            matchesDate = transactionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            matchesDate = transactionDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            matchesDate = transactionDate >= new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateFilter]);

  return {
    transactions,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    filteredTransactions,
    exportPaymentHistory,
    refetch: fetchPaymentHistory
  };
}

export type { PaymentTransaction, PaymentStats, MonthlySpending, PaymentMethodStats };