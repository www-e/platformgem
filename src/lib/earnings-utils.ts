// src/lib/earnings-utils.ts

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

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

export function formatMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SA', { 
    month: 'long', 
    year: 'numeric' 
  });
}

export function getTransactionStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'معلق';
    case 'refunded':
      return 'مرفوض';
    default:
      return status;
  }
}

export function getTransactionStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'refunded':
      return 'destructive';
    default:
      return 'secondary';
  }
}