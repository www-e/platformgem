// src/lib/logs-utils.ts
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Users, 
  CreditCard, 
  BookOpen, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';

/**
 * Get severity icon component
 */
export function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'SUCCESS':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'ERROR':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'WARNING':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
}

/**
 * Get severity badge component
 */
export function getSeverityBadge(severity: string) {
  const colors = {
    SUCCESS: 'bg-green-100 text-green-800',
    ERROR: 'bg-red-100 text-red-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    INFO: 'bg-blue-100 text-blue-800'
  };

  const labels = {
    SUCCESS: 'نجح',
    ERROR: 'خطأ',
    WARNING: 'تحذير',
    INFO: 'معلومات'
  };

  return (
    <Badge className={colors[severity as keyof typeof colors] || colors.INFO}>
      {labels[severity as keyof typeof labels] || labels.INFO}
    </Badge>
  );
}

/**
 * Get type icon component
 */
export function getTypeIcon(type: string) {
  switch (type) {
    case 'USER':
      return <Users className="w-4 h-4" />;
    case 'PAYMENT':
      return <CreditCard className="w-4 h-4" />;
    case 'COURSE':
      return <BookOpen className="w-4 h-4" />;
    case 'CERTIFICATE':
      return <Award className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

/**
 * Format timestamp to Arabic date and time
 */
export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString('ar-SA'),
    time: date.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  };
}