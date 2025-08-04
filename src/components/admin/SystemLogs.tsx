// src/components/admin/SystemLogs.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { LogsHeader } from './system-logs/LogsHeader';
import { LogsStatsCards } from './system-logs/LogsStatsCards';
import { LogsFilters } from './system-logs/LogsFilters';
import { LogsTable } from './system-logs/LogsTable';
import { LoadingState } from './system-logs/LoadingState';

export function SystemLogs() {
  const {
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
  } = useSystemLogs();

  if (isLoading && logs.length === 0) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <LogsHeader onRefresh={fetchLogs} onExport={exportLogs} />

      {stats && <LogsStatsCards stats={stats} />}

      <LogsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        severityFilter={severityFilter}
        setSeverityFilter={setSeverityFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        onClearFilters={clearFilters}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="user">المستخدمين</TabsTrigger>
          <TabsTrigger value="payment">المدفوعات</TabsTrigger>
          <TabsTrigger value="course">الدورات</TabsTrigger>
          <TabsTrigger value="certificate">الشهادات</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <LogsTable
            logs={logs}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onNextPage={goToNextPage}
            onPrevPage={goToPrevPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}