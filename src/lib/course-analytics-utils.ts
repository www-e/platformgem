// src/lib/course-analytics-utils.ts
import { Badge } from '@/components/ui/badge';

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
 * Get engagement badge component
 */
export function getEngagementBadge(score: number) {
  if (score >= 80) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
  if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">جيد</Badge>;
  return <Badge className="bg-red-100 text-red-800">يحتاج تحسين</Badge>;
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