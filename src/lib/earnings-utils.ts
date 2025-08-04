// src/lib/earnings-utils.ts
// Re-export shared utilities for backward compatibility
export { 
  formatCurrency, 
  formatCurrencyWithDecimals, 
  formatDate, 
  formatMonthYear,
  getStatusText as getTransactionStatusText,
  getStatusVariant as getTransactionStatusVariant
} from './shared-utils';