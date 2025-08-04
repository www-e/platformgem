// src/hooks/useRevenueAnalytics.ts
'use client';

import { useState, useEffect } from 'react';

interface TopCourse {
  id: string;
  title: string;
  revenue: number;
  enrollments: number;
  professor: string;
}

interface Payment {
  id: string;
  amount: number;
  courseName: string;
  studentName: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  enrollments: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  topCourses: TopCourse[];
  recentPayments: Payment[];
  monthlyData: MonthlyRevenue[];
  paymentMethods: PaymentMethodStats[];
}

export function useRevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`/api/admin/revenue-analytics?period=${selectedPeriod}`);
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/admin/export-revenue-report', {
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
        a.download = `revenue-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
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
    revenueData,
    isLoading,
    selectedPeriod,
    setSelectedPeriod,
    exportReport
  };
}

export type { 
  RevenueData, 
  TopCourse, 
  Payment, 
  MonthlyRevenue, 
  PaymentMethodStats 
};