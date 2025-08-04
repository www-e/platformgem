// src/lib/shared-utils.ts
// Consolidated utility functions to eliminate duplication across the codebase

/**
 * Currency formatting utilities
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatCurrencyWithDecimals(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP'
  }).format(amount);
}

/**
 * Date formatting utilities
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

export function formatMonthYear(date?: Date): string {
  const targetDate = date || new Date();
  return targetDate.toLocaleDateString('ar-SA', { 
    month: 'long', 
    year: 'numeric' 
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('ar-SA');
}

/**
 * Duration formatting utilities
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return 'غير محدد';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Status utilities for transactions/payments
 */
export function getStatusText(status: string, type: 'transaction' | 'payment' = 'transaction'): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'معلق';
    case 'refunded':
      return 'مرفوض';
    case 'failed':
      return 'فشل';
    case 'processing':
      return 'قيد المعالجة';
    default:
      return status;
  }
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
    case 'processing':
      return 'secondary';
    case 'refunded':
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Progress and calculation utilities
 */
export function calculateProgressPercentage(
  current: number, 
  total: number | null
): number {
  if (!total || total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function calculateAverageValue(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Text and display utilities
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}