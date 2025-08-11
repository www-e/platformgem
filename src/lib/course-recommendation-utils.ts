// src/lib/course-recommendation-utils.ts

/**
 * Get recommendation badge text based on reason
 */
export function getRecommendationBadgeText(reason: string): string {
  switch (reason) {
    case 'category_match':
      return 'مشابه لاهتماماتك';
    case 'similar_students':
      return 'اختيار الملتحقين';
    case 'trending':
      return 'رائج الآن';
    case 'professor_match':
      return 'من مدرس مفضل';
    case 'completion_based':
      return 'مقترح لك';
    default:
      return 'مقترح';
  }
}

/**
 * Get recommendation badge variant based on reason
 */
export function getRecommendationBadgeVariant(reason: string): 'default' | 'secondary' | 'outline' {
  switch (reason) {
    case 'category_match':
      return 'default';
    case 'similar_students':
      return 'secondary';
    case 'trending':
      return 'default';
    case 'professor_match':
      return 'secondary';
    case 'completion_based':
      return 'default';
    default:
      return 'outline';
  }
}

/**
 * Get level badge text
 */
export function getLevelBadgeText(level: string): string {
  switch (level) {
    case 'beginner':
      return 'مبتدئ';
    case 'intermediate':
      return 'متوسط';
    case 'advanced':
      return 'متقدم';
    default:
      return 'غير محدد';
  }
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
 * Format price in Arabic currency format
 */
export function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'مجاني';
  
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(price);
}

// Additional exports for backward compatibility
export const getRecommendationBadge = getRecommendationBadgeText;
export const getLevelBadge = getLevelBadgeText;