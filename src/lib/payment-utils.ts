// src/lib/payment-utils.ts
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Receipt
} from 'lucide-react';

/**
 * Get status badge component for payment status
 */
export function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />مكتمل</Badge>;
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />معلق</Badge>;
    case 'failed':
      return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />فاشل</Badge>;
    case 'cancelled':
      return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />ملغي</Badge>;
    case 'refunded':
      return <Badge className="bg-gray-100 text-gray-800"><Receipt className="h-3 w-3 mr-1" />مسترد</Badge>;
    default:
      return <Badge variant="outline">غير محدد</Badge>;
  }
}

/**
 * Get payment method icon component
 */
export function getPaymentMethodIcon(method: string) {
  switch (method.toLowerCase()) {
    case 'credit_card':
    case 'debit_card':
      return <CreditCard className="h-4 w-4" />;
    default:
      return <DollarSign className="h-4 w-4" />;
  }
}

/**
 * Format currency amount in Arabic locale
 */
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format date in Arabic locale
 */
export function formatDateArabic(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

/**
 * Format payment method display name
 */
export function formatPaymentMethod(method: string): string {
  return method.replace('_', ' ');
}