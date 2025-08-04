// src/lib/revenue-analytics-utils.ts

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

export function formatMonthYear(): string {
  return new Date().toLocaleDateString('ar-SA', { 
    month: 'long', 
    year: 'numeric' 
  });
}

export function getPaymentStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'معلق';
    case 'failed':
      return 'فشل';
    default:
      return status;
  }
}

export function getPaymentStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function calculateAverageOrderValue(payments: any[]): number {
  if (payments.length === 0) return 0;
  return payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;
}