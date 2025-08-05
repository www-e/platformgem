// src/lib/logs-utils.ts

/**
 * Get severity color class
 */
export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'SUCCESS':
      return 'text-green-500';
    case 'ERROR':
      return 'text-red-500';
    case 'WARNING':
      return 'text-yellow-500';
    default:
      return 'text-blue-500';
  }
}

/**
 * Get severity background color
 */
export function getSeverityBgColor(severity: string): string {
  switch (severity) {
    case 'SUCCESS':
      return 'bg-green-100';
    case 'ERROR':
      return 'bg-red-100';
    case 'WARNING':
      return 'bg-yellow-100';
    default:
      return 'bg-blue-100';
  }
}

/**
 * Get severity text in Arabic
 */
export function getSeverityText(severity: string): string {
  switch (severity) {
    case 'SUCCESS':
      return 'نجح';
    case 'ERROR':
      return 'خطأ';
    case 'WARNING':
      return 'تحذير';
    default:
      return 'معلومات';
  }
}

/**
 * Get action type text in Arabic
 */
export function getActionTypeText(actionType: string): string {
  switch (actionType) {
    case 'USER_REGISTRATION':
      return 'تسجيل مستخدم';
    case 'PAYMENT_PROCESSED':
      return 'معالجة دفع';
    case 'COURSE_ENROLLMENT':
      return 'تسجيل في دورة';
    case 'CERTIFICATE_GENERATED':
      return 'إنشاء شهادة';
    case 'SYSTEM_ERROR':
      return 'خطأ في النظام';
    default:
      return actionType;
  }
}

/**
 * Format log timestamp
 */
export function formatLogTimestamp(timestamp: Date): string {
  return new Date(timestamp).toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get action icon name
 */
export function getActionIconName(actionType: string): string {
  switch (actionType) {
    case 'USER_REGISTRATION':
      return 'Users';
    case 'PAYMENT_PROCESSED':
      return 'CreditCard';
    case 'COURSE_ENROLLMENT':
      return 'BookOpen';
    case 'CERTIFICATE_GENERATED':
      return 'Award';
    case 'SYSTEM_ERROR':
      return 'AlertCircle';
    default:
      return 'Activity';
  }
}

// Additional exports for backward compatibility
export const formatTimestamp = formatLogTimestamp;
export const getSeverityIcon = getSeverityColor;
export const getTypeIcon = getActionIconName;
export const getSeverityBadge = getSeverityText;