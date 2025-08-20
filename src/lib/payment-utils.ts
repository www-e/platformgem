// src/lib/payment-utils.ts

/**
 * Get payment status color class
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'text-green-600';
    case 'PENDING':
      return 'text-yellow-600';
    case 'FAILED':
      return 'text-red-600';
    case 'CANCELLED':
      return 'text-gray-600';
    case 'REFUNDED':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get payment status background color
 */
export function getPaymentStatusBgColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100';
    case 'PENDING':
      return 'bg-yellow-100';
    case 'FAILED':
      return 'bg-red-100';
    case 'CANCELLED':
      return 'bg-gray-100';
    case 'REFUNDED':
      return 'bg-blue-100';
    default:
      return 'bg-gray-100';
  }
}

/** 
 * Get payment status text in English
 */
export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'PENDING':
      return 'Pending';
    case 'FAILED':
      return 'Failed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'REFUNDED':
      return 'Refunded';
    default:
      return 'Undefined';
  }
}

/**
 * Get payment method text in English
 */
export function getPaymentMethodText(method: string): string {
  switch (method) {
    case 'CARD':
      return 'Card';
    case 'WALLET':
      return 'Wallet';
    default:
      return method;
  }
}

/**
 * Format payment amount
 */
export function formatPaymentAmount(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * Format currency with default USD
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return formatPaymentAmount(amount, currency);
}

/**
 * Get payment method icon name
 */
export function getPaymentMethodIconName(method: string): string {
  switch (method) {
    case 'CARD':
      return 'CreditCard';
    case 'WALLET':
      return 'DollarSign';
    default:
      return 'CreditCard';
  }
}
export const getPaymentMethodIcon = getPaymentMethodIconName;
export const formatPaymentMethod = getPaymentMethodText;
export const getStatusBadge = getPaymentStatusText;
export const formatDateArabic = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US');
};