// src/lib/course-form-utils.ts
import { BookOpen, Users, Image as ImageIcon, Eye } from 'lucide-react';

/**
 * Form steps configuration
 */
export const FORM_STEPS = [
  { number: 1, title: 'المعلومات الأساسية', icon: BookOpen },
  { number: 2, title: 'إعدادات التدريس', icon: Users },
  { number: 3, title: 'الصورة والمحتوى', icon: ImageIcon },
  { number: 4, title: 'المراجعة والنشر', icon: Eye }
];

/**
 * Currency options for the form
 */
export const CURRENCY_OPTIONS = [
  { value: 'EGP', label: 'جنيه مصري (EGP)' },
  { value: 'USD', label: 'دولار أمريكي (USD)' },
  { value: 'EUR', label: 'يورو (EUR)' }
];

/**
 * Calculate progress percentage based on current step
 */
export function calculateProgress(currentStep: number, totalSteps: number = 4): number {
  return (currentStep / totalSteps) * 100;
}