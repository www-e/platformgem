// src/hooks/useEarningsReport.ts
'use client';

import { useState, useEffect } from 'react';

interface TopEarningCourse {
  id: string;
  title: string;
  earnings: number;
  students: number;
  averagePrice: number;
  conversionRate: number;
}

interface Transaction {
  id: string;
  courseName: string;
  studentName: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'refunded';
  commission: number;
}

interface MonthlyEarnings {
  month: string;
  earnings: number;
  students: number;
  courses: number;
  growth: number;
}

interface CategoryEarnings {
  category: string;
  earnings: number;
  percentage: number;
  courses: number;
}

interface PayoutHistory {
  id: string;
  amount: number;
  date: Date;
  status: 'completed' | 'pending' | 'processing';
  method: string;
}

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  dailyEarnings: number;
  earningsGrowth: number;
  pendingPayouts: number;
  nextPayoutDate: Date;
  topEarningCourses: TopEarningCourse[];
  recentTransactions: Transaction[];
  monthlyBreakdown: MonthlyEarnings[];
  earningsByCategory: CategoryEarnings[];
  payoutHistory: PayoutHistory[];
}

export function useEarningsReport() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      const response = await fetch(`/api/professor/earnings?period=${selectedPeriod}`);
      const data = await response.json();
      setEarningsData(data);
    } catch (error) {
      console.error('Failed to fetch earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/professor/export-earnings-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period: selectedPeriod }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `earnings-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  return {
    earningsData,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    exportReport
  };
}

export type { 
  EarningsData, 
  TopEarningCourse, 
  Transaction, 
  MonthlyEarnings, 
  CategoryEarnings, 
  PayoutHistory 
};