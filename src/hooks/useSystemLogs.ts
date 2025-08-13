// src/hooks/useSystemLogs.ts
"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import{ LogEntry } from "@/app/api/admin/logs/route";

interface LogStats {
  totalLogs: number;
  todayLogs: number;
  errorLogs: number;
  warningLogs: number;
  userActions: number;
  paymentActions: number;
  courseActions: number;
  systemActions: number;
}

export function useSystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [activeTab, searchTerm, severityFilter, dateFilter, currentPage]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(activeTab !== 'all' && { type: activeTab.toUpperCase() }),
        ...(searchTerm && { search: searchTerm }),
        ...(severityFilter !== 'all' && { severity: severityFilter.toUpperCase() }),
        ...(dateFilter !== 'all' && { dateFilter })
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setLogs(result.data.logs);
        setTotalPages(result.data.pagination.pages);
      } else {
        toast.error('فشل في تحميل السجلات');
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/logs/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch log stats:', error);
    }
  };

  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(activeTab !== 'all' && { type: activeTab.toUpperCase() }),
        ...(searchTerm && { search: searchTerm }),
        ...(severityFilter !== 'all' && { severity: severityFilter.toUpperCase() }),
        ...(dateFilter !== 'all' && { dateFilter })
      });

      const response = await fetch(`/api/admin/logs/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('تم تصدير السجلات بنجاح');
      } else {
        toast.error('فشل في تصدير السجلات');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('حدث خطأ في التصدير');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setDateFilter('today');
    setCurrentPage(1);
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  return {
    logs,
    stats,
    isLoading,
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    totalPages,
    fetchLogs,
    exportLogs,
    clearFilters,
    goToNextPage,
    goToPrevPage
  };
}

export type { LogEntry, LogStats };