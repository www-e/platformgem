// src/hooks/useCourseCard.ts
'use client';

import { useState } from 'react';
import { UserRole } from '@prisma/client';
import { CourseWithMetadata } from '@/types/course';
import { getCourseUserActions } from '@/lib/course-utils';

export function useCourseCard(course: CourseWithMetadata, userRole?: UserRole, userId?: string) {
  const [isLoading, setIsLoading] = useState(false);
  
  const userActions = getCourseUserActions(course, userRole, userId);

  const handleEnroll = async () => {
    if (!userId) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      // Check if course is free or paid
      const isFree = !course.price || course.price <= 0;
      
      if (isFree) {
        // Free enrollment
        const response = await fetch(`/api/courses/${course.id}/enroll-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentType: 'free'
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Redirect to course content
          window.location.href = result.redirectTo || `/courses/${course.id}`;
        } else {
          console.error('Free enrollment failed:', result.error);
          // You can show a toast notification here
        }
      } else {
        // Paid course - redirect to payment
        window.location.href = `/courses/${course.id}/payment`;
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    userActions,
    handleEnroll
  };
}