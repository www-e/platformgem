// src/lib/revenue-analytics-utils.ts
// Re-export shared utilities for backward compatibility
export { 
  formatCurrency, 
  formatCurrencyWithDecimals, 
  formatDate, 
  formatMonthYear,
  getStatusText as getPaymentStatusText,
  getStatusVariant as getPaymentStatusVariant,
  calculateAverageValue as calculateAverageOrderValue
} from './shared-utils';