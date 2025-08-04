// src/components/admin/system-logs/LogEntry.tsx
import { Calendar, Clock, User } from 'lucide-react';
import { getSeverityIcon, getSeverityBadge, getTypeIcon, formatTimestamp } from '@/lib/logs-utils';
import type { LogEntry as LogEntryType } from '@/hooks/useSystemLogs';

interface LogEntryProps {
  log: LogEntryType;
}

export function LogEntry({ log }: LogEntryProps) {
  const { date, time } = formatTimestamp(log.timestamp);
  
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-shrink-0 mt-1">
        {getSeverityIcon(log.severity)}
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {getTypeIcon(log.type)}
            <span>{log.type}</span>
          </div>
          {getSeverityBadge(log.severity)}
          <span className="text-sm font-medium">{log.action}</span>
        </div>
        
        <p className="text-sm mb-2">{log.description}</p>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
          {log.userName && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{log.userName}</span>
            </div>
          )}
          {log.ipAddress && (
            <span>IP: {log.ipAddress}</span>
          )}
        </div>
        
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              عرض التفاصيل
            </summary>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}