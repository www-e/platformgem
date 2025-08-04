// src/lib/access-messages.ts

import { CourseAccessResult } from './services/course-access.service';

/**
 * Generates a user-friendly title, description, and action text
 * based on the result of a course access check.
 * @param result - The CourseAccessResult object from the check.
 * @returns An object with strings ready for display in the UI.
 */
export function getAccessMessage(result: CourseAccessResult): {
  title: string;
  description: string;
  actionText?: string;
  actionType?: 'login' | 'payment' | 'enrollment' | 'contact';
} {
  switch (result.reason) {
    case 'enrolled':
      return {
        title: 'مرحباً بك في الدورة',
        description: 'يمكنك الآن الوصول إلى جميع دروس الدورة ومتابعة تقدمك.',
      };
    case 'free_course':
      return {
        title: 'دورة مجانية',
        description: 'هذه الدورة مجانية ومتاحة لجميع المستخدمين.',
        actionText: 'ابدأ التعلم الآن',
        actionType: 'enrollment',
      };
    case 'admin_access':
      return {
        title: 'وصول إداري',
        description: 'لديك صلاحية الوصول الكامل لهذه الدورة كمدير للنظام.',
      };
    case 'professor_owns':
      return {
        title: 'دورتك التعليمية',
        description: 'هذه دورتك الخاصة. يمكنك إدارة المحتوى ومتابعة الطلاب.',
      };
    case 'payment_required':
      const price = result.course?.price
        ? new Intl.NumberFormat('ar-EG', {
            style: 'currency',
            currency: result.course.currency || 'EGP',
            minimumFractionDigits: 0,
          }).format(Number(result.course.price))
        : '';

      return {
        title: 'دورة مدفوعة',
        description: `هذه دورة مدفوعة بسعر ${price}. يجب شراء الدورة للوصول إلى المحتوى.`,
        actionText: `اشترِ الآن بـ ${price}`,
        actionType: 'payment',
      };
    case 'not_published':
      return {
        title: 'الدورة غير منشورة',
        description: 'هذه الدورة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
      };
    case 'not_authenticated':
      return {
        title: 'يجب تسجيل الدخول',
        description: 'يجب تسجيل الدخول أولاً للوصول إلى محتوى الدورة.',
        actionText: 'تسجيل الدخول',
        actionType: 'login',
      };
    case 'not_found':
    default:
      return {
        title: 'الدورة غير موجودة',
        description: 'لم يتم العثور على الدورة المطلوبة.',
      };
  }
}

/**
 * Gets a user-friendly error message for enrollment issues.
 * @param reason - The server-side reason for the enrollment failure.
 * @returns A string containing the user-friendly message.
 */
export function getEnrollmentErrorMessage(reason: string): string {
  switch (reason) {
    case 'not_authenticated':
      return 'يجب تسجيل الدخول أولاً';
    case 'invalid_role':
      return 'غير مصرح لك بالتسجيل في الدورات';
    case 'course_not_found':
      return 'الدورة غير موجودة';
    case 'course_not_published':
      return 'الدورة غير متاحة حالياً';
    case 'own_course':
      return 'لا يمكنك التسجيل في دورتك الخاصة';
    case 'already_enrolled':
      return 'أنت مسجل في هذه الدورة بالفعل';
    case 'payment_required':
      return 'هذه دورة مدفوعة. يجب إتمام الدفع أولاً';
    default:
      return 'حدث خطأ أثناء التحقق من إمكانية التسجيل';
  }
}