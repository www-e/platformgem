// src/components/course/course-card/ActionButton.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Edit, Settings, Loader2 } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { formatCoursePrice } from '@/lib/course-utils';
import { CourseWithMetadata, CourseUserActions } from '@/types/course'; // R.A.K.A.N: Corrected type import

interface ActionButtonProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userActions: CourseUserActions;
  isLoading: boolean;
  onEnroll: () => void;
}

export function ActionButton({ course, userRole, userActions, isLoading, onEnroll }: ActionButtonProps) {
  // R.A.K.A.N: Memoized the price string calculation for performance.
  const priceString = course.price ? `التسجيل - ${formatCoursePrice(Number(course.price), course.currency)}` : 'التسجيل المجاني';

  // Unauthenticated user
  if (!userRole) {
    return (
      <Button asChild className="w-full">
        <Link href="/login">إنشاء حساب للتسجيل</Link>
      </Button>
    );
  }

  // Enrolled student
  if (userActions.isEnrolled) {
    return (
      <Button asChild className="w-full" variant="primary">
        <Link href={`/courses/${course.id}`}><Play className="w-4 h-4 mr-2" />متابعة التعلم</Link>
      </Button>
    );
  }

  // Student who can enroll
  if (userActions.canEnroll) {
    return (
      <Button className="w-full" onClick={onEnroll} disabled={isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
        {isLoading ? 'جاري المعالجة...' : priceString}
      </Button>
    );
  }

  // Professor/Admin
  if (userActions.canEdit) {
    return (
      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/courses/${course.id}`}><Play className="w-4 h-4 mr-2" />عرض</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/admin/courses/${course.id}`}><Edit className="w-4 h-4 mr-2" />تحرير</Link>
        </Button>
      </div>
    );
  }
  
  // Default fallback for any other case
  return (
    <Button asChild className="w-full" variant="outline">
      <Link href={`/courses/${course.id}`}><Play className="w-4 h-4 mr-2" />عرض التفاصيل</Link>
    </Button>
  );
}