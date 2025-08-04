// src/components/shared/PaymentStatusBadge.tsx

import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: string;
}

/**
 * A reusable component to display a styled badge for payment status.
 */
export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  switch (status.toLowerCase()) {
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 border-green-200"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          مكتمل
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          variant="outline"
          className="bg-yellow-100 text-yellow-800 border-yellow-200"
        >
          <Clock className="h-3 w-3 mr-1" />
          معلق
        </Badge>
      );
    case 'failed':
      return (
        <Badge
          variant="outline"
          className="bg-red-100 text-red-800 border-red-200"
        >
          <XCircle className="h-3 w-3 mr-1" />
          فاشل
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="bg-gray-100 text-gray-800 border-gray-200"
        >
          <XCircle className="h-3 w-3 mr-1" />
          ملغي
        </Badge>
      );
    default:
      return <Badge variant="outline">غير محدد</Badge>;
  }
}