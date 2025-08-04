// src/lib/engagement-utils.ts
import { Badge } from '@/components/ui/badge';

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
 * Format duration in minutes to Arabic display
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
}

/**
 * Format time ago in Arabic
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);

  if (days > 0) return `منذ ${days} يوم`;
  if (hours > 0) return `منذ ${hours} ساعة`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

/**
 * Get activity type display text in Arabic
 */
export function getActivityTypeText(activityType: string, duration?: number): string {
  switch (activityType) {
    case 'video_watch':
      return `شاهد ${formatDuration(duration || 0)}`;
    case 'lesson_complete':
      return 'أكمل الدرس';
    case 'quiz_attempt':
      return 'حاول الاختبار';
    case 'comment':
      return 'أضاف تعليق';
    default:
      return 'نشاط';
  }
}

/**
 * Get interaction type display text in Arabic
 */
export function getInteractionTypeText(type: string): string {
  switch (type) {
    case 'question':
      return 'سؤال';
    case 'comment':
      return 'تعليق';
    case 'completion':
      return 'إكمال';
    case 'milestone':
      return 'إنجاز';
    default:
      return 'تفاعل';
  }
}