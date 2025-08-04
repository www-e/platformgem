// src/components/admin/system-logs/LogsHeader.tsx
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';

interface LogsHeaderProps {
  onRefresh: () => void;
  onExport: () => void;
}

export function LogsHeader({ onRefresh, onExport }: LogsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">سجلات النظام</h1>
        <p className="text-muted-foreground">
          مراقبة وتتبع جميع أنشطة النظام
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          تحديث
        </Button>
        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          تصدير
        </Button>
      </div>
    </div>
  );
}