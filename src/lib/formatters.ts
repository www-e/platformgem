// src/lib/formatters.ts

/**
 * Formats a number as Egyptian currency (EGP).
 * @param amount - The number to format.
 * @returns A string representing the formatted currency.
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  /**
   * Formats a duration in seconds into a human-readable string (hours and minutes).
   * @param seconds - The total seconds.
   * @returns A formatted string like "X ساعة Y دقيقة" or "Y دقيقة".
   */
  export const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
  
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };
  
  /**
   * Formats a date string into a localized, readable format.
   * @param dateString - The ISO date string to format.
   * @returns A formatted date string like "يونيو 15, 10:30 ص".
   */
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };