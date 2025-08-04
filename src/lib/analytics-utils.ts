// src/lib/analytics-utils.ts

/**
 * Format time in seconds to Arabic display format
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  }
  return `${minutes} دقيقة`;
}

/**
 * Format date string to Arabic locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get current date in Arabic format
 */
export function getCurrentDateArabic(): string {
  return new Date().toLocaleDateString('ar-EG');
}

/**
 * Get badge variant based on progress percentage
 */
export function getProgressBadgeVariant(progressPercent: number): "default" | "secondary" | "outline" {
  if (progressPercent >= 80) return "default";
  if (progressPercent >= 50) return "secondary";
  return "outline";
}

/**
 * Get badge variant based on completion rate
 */
export function getCompletionBadgeVariant(completionRate: number): "default" | "secondary" | "outline" {
  if (completionRate >= 70) return "default";
  if (completionRate >= 40) return "secondary";
  return "outline";
}