// src/lib/api/course-access.ts
"use client";

import { CourseAccessResult } from '@/lib/course-access';

/**
 * Client-side function to check course access
 */
export async function checkCourseAccess(courseId: string): Promise<CourseAccessResult> {
  try {
    const response = await fetch(`/api/courses/${courseId}/access`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check course access');
    }

    return await response.json();
  } catch (error) {
    console.error('Course access check error:', error);
    return {
      hasAccess: false,
      reason: 'not_found'
    };
  }
}

/**
 * Client-side function to enroll in a free course
 */
export async function enrollInFreeCourse(courseId: string): Promise<{
  success: boolean;
  message: string;
  enrollmentId?: string;
}> {
  try {
    const response = await fetch(`/api/courses/${courseId}/enroll-free`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || 'حدث خطأ أثناء التسجيل'
      };
    }

    return result;
  } catch (error) {
    console.error('Free course enrollment error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء التسجيل في الدورة'
    };
  }
}

/**
 * Client-side function to get enrollment status
 */
export async function getEnrollmentStatus(courseId: string): Promise<{
  isEnrolled: boolean;
  enrollment?: {
    id: string;
    progressPercent: number;
    enrolledAt: string;
  };
  paymentStatus?: 'none' | 'pending' | 'completed' | 'failed';
}> {
  try {
    const response = await fetch(`/api/courses/${courseId}/enrollment-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { isEnrolled: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Enrollment status check error:', error);
    return { isEnrolled: false };
  }
}