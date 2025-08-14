// src/lib/shared-utils.ts
// Backward compatibility layer - use core-utils.ts for new code

export {
  formatCurrency,
  formatCurrencyWithDecimals,
  formatDate,
  formatMonthYear,
  formatDateTime,
  formatDuration,
  getStatusText,
  getStatusVariant,
  calculateProgressPercentage,
  calculateAverageValue,
  truncateText,
  capitalizeFirst
} from './core-utils';