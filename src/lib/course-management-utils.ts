// src/lib/course-management-utils.ts

/**
 * Format price with currency
 */
export function formatPrice(price: number | null, currency: string = 'EGP'): string {
  if (!price) return 'مجاني';
  
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0
  }).format(price);
}

/**
 * Format date to Arabic locale
 */
export function formatDateArabic(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-SA');
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(isPublished: boolean): "default" | "secondary" {
  return isPublished ? 'default' : 'secondary';
}

/**
 * Get status text
 */
export function getStatusText(isPublished: boolean): string {
  return isPublished ? 'منشورة' : 'مسودة';
}

/**
 * Get action text for course
 */
export function getActionText(isPublished: boolean): string {
  return isPublished ? 'إلغاء النشر' : 'نشر الدورة';
}