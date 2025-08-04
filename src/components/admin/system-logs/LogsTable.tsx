// src/components/admin/system-logs/LogsTable.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { LogEntry } from './LogEntry';
import type { LogEntry as LogEntryType } from '@/hooks/useSystemLogs';

interface LogsTableProps {
  logs: LogEntryType[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function LogsTable({ 
  logs, 
  isLoading, 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage 
}: LogsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل الأنشطة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => (
            <LogEntry key={log.id} log={log} />
          ))}
          
          {logs.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد سجلات مطابقة للبحث</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevPage}
              disabled={currentPage === 1}
            >
              السابق
            </Button>
            
            <span className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
            >
              التالي
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}