// src/lib/core-utils.ts
// Consolidated utility functions to eliminate duplication across the codebase

/**
 * CSS class name utilities
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Date and time formatting utilities - Unified implementation
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('ar-SA');
}

export function formatMonthYear(date?: Date): string {
  const targetDate = date || new Date();
  return targetDate.toLocaleDateString('ar-SA', { 
    month: 'long', 
    year: 'numeric' 
  });
}

export function getCurrentDateArabic(): string {
  return new Date().toLocaleDateString('ar-EG');
}

/**
 * Time formatting utilities
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} ساعة ${minutes} دقيقة`;
  }
  return `${minutes} دقيقة`;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return 'غير محدد';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `0:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Currency formatting utilities
 */
export function formatCurrency(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatCurrencyWithDecimals(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Status and badge utilities
 */
export function getStatusText(status: string): string {
  switch (status) {
    case 'completed':
      return 'مكتمل';
    case 'pending':
      return 'معلق';
    case 'refunded':
      return 'مرفوض';
    case 'failed':
      return 'فشل';
    case 'processing':
      return 'قيد المعالجة';
    default:
      return status;
  }
}

export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
    case 'processing':
      return 'secondary';
    case 'refunded':
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function getProgressBadgeVariant(progressPercent: number): "default" | "secondary" | "outline" {
  if (progressPercent >= 80) return "default";
  if (progressPercent >= 50) return "secondary";
  return "outline";
}

export function getCompletionBadgeVariant(completionRate: number): "default" | "secondary" | "outline" {
  if (completionRate >= 70) return "default";
  if (completionRate >= 40) return "secondary";
  return "outline";
}

/**
 * Calculation utilities
 */
export function calculateProgressPercentage(current: number, total: number | null): number {
  if (!total || total === 0) return 0;
  return Math.round((current / total) * 100);
}

export function calculateAverageValue(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Text utilities
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * User role utilities
 */
import { Shield, GraduationCap, User } from "lucide-react";

export function getRoleIcon(role: string) {
  switch (role) {
    case "ADMIN":
      return Shield;
    case "PROFESSOR":
      return GraduationCap;
    case "STUDENT":
    default:
      return User;
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-red-100 text-red-800";
    case "PROFESSOR":
      return "bg-blue-100 text-blue-800";
    case "STUDENT":
    default:
      return "bg-green-100 text-green-800";
  }
}

export function getRoleDisplayName(role: string): string {
  switch (role) {
    case "ADMIN":
      return "مدير";
    case "PROFESSOR":
      return "أستاذ";
    case "STUDENT":
    default:
      return "طالب";
  }
}