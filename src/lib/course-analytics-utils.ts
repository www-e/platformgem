// src/lib/course-analytics-utils.ts

/**
 * Format watch time in minutes to Arabic display format
 */
export function formatWatchTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}س ${mins}د`;
  }
  return `${mins}د`;
}

/**
 * Get engagement score color class
 */
export function getEngagementColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get engagement badge variant
 */
export function getEngagementBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default';
  if (score >= 60) return 'secondary';
  return 'destructive';
}

/**
 * Get engagement badge text
 */
export function getEngagementBadgeText(score: number): string {
  if (score >= 80) return 'ممتاز';
  if (score >= 60) return 'جيد';
  return 'يحتاج تحسين';
}

/**
 * Calculate percentage for progress bars
 */
export function calculatePercentage(value: number, maxValue: number): number {
  return Math.min((value / maxValue) * 100, 100);
}

/**
 * Format date to Arabic locale
 */
export function formatDateArabic(date: Date): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

// Additional exports for backward compatibility
export const getEngagementBadge = getEngagementBadgeText;