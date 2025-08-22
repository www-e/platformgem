// src/components/admin/system-logs/LogsStatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LogStats } from '@/hooks/useSystemLogs';

interface LogsStatsCardsProps {
  stats: LogStats;
}

export function LogsStatsCards({ stats }: LogsStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.todayLogs}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Errors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.errorLogs}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Warnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.warningLogs}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.userActions}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-indigo-600">{stats.paymentActions}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-pink-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-pink-600">{stats.courseActions}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-gray-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-600">{stats.systemActions}</div>
        </CardContent>
      </Card>
    </div>
  );
}