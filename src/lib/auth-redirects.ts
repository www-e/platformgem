// src/lib/auth-redirects.ts
import { UserRole } from '@prisma/client';

/**
 * Get the appropriate dashboard URL based on user role
 */
export function getRoleBasedRedirectUrl(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'PROFESSOR':
      return '/professor';
    case 'STUDENT':
      return '/dashboard'; // Updated to use /dashboard for students
    default:
      return '/profile'; // Fallback
  }
}

/**
 * Check if user is accessing the correct dashboard for their role
 */
export function isCorrectDashboardForRole(pathname: string, role: UserRole): boolean {
  const correctUrl = getRoleBasedRedirectUrl(role);
  return pathname.startsWith(correctUrl);
}

/**
 * Get role-specific navigation items
 */
export function getRoleNavigation(role: UserRole) {
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/admin', label: 'لوحة التحكم' },
        { href: '/admin/categories', label: 'الفئات' },
        { href: '/admin/courses', label: 'الدورات' },
        { href: '/admin/professors', label: 'المدرسين' },
        { href: '/admin/students', label: 'الطلاب' },
      ];
    case 'PROFESSOR':
      return [
        { href: '/professor', label: 'لوحة التحكم' },
        { href: '/professor/courses', label: 'دوراتي' },
        { href: '/professor/analytics', label: 'التحليلات' },
      ];
    case 'STUDENT':
      return [
        { href: '/dashboard', label: 'لوحة التحكم' },
        { href: '/courses', label: 'الدورات' },
        { href: '/certificates', label: 'الشهادات' },
      ];
    default:
      return [
        { href: '/profile', label: 'الملف الشخصي' },
      ];
  }
}