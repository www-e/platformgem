// src/components/course/course-card/ActionButton.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, Play, Edit, Settings } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { formatCoursePrice } from '@/lib/course-utils';
import { CourseWithMetadata } from '@/types/course';

interface UserActions {
  isEnrolled: boolean;
  canEnroll: boolean;
  canEdit: boolean;
  canManage: boolean;
}

interface ActionButtonProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userActions: UserActions;
  isLoading: boolean;
  onEnroll: () => void;
}

export function ActionButton({ course, userRole, userActions, isLoading, onEnroll }: ActionButtonProps) {
  if (!userRole) {
    // Unauthenticated user
    return (
      <Link href="/signup">
        <Button className="w-full">
          إنشاء حساب للتسجيل
        </Button>
      </Link>
    );
  }

  if (userActions.isEnrolled) {
    // Enrolled student
    return (
      <Link href={`/courses/${course.id}`}>
        <Button className="w-full" variant="primary">
          <Play className="w-4 h-4 mr-2" />
          متابعة التعلم
        </Button>
      </Link>
    );
  }

  if (userActions.canEnroll) {
    // Student can enroll
    return (
      <Button 
        className="w-full" 
        onClick={onEnroll}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <BookOpen className="w-4 h-4 mr-2" />
        )}
        {course.price ? `التسجيل - ${formatCoursePrice(course.price, course.currency)}` : 'التسجيل المجاني'}
      </Button>
    );
  }

  if (userActions.canEdit) {
    // Professor/Admin can edit
    return (
      <div className="flex gap-2">
        <Link href={`/courses/${course.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            عرض
          </Button>
        </Link>
        <Link href={`/admin/courses/${course.id}`}>
          <Button className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            تحرير
          </Button>
        </Link>
      </div>
    );
  }

  if (userActions.canManage) {
    // Admin can manage
    return (
      <div className="flex gap-2">
        <Link href={`/courses/${course.id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            <Play className="w-4 h-4 mr-2" />
            عرض
          </Button>
        </Link>
        <Link href={`/admin/courses/${course.id}`}>
          <Button className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            إدارة
          </Button>
        </Link>
      </div>
    );
  }

  // Default view button
  return (
    <Link href={`/courses/${course.id}`}>
      <Button className="w-full" variant="outline">
        <Play className="w-4 h-4 mr-2" />
        عرض التفاصيل
      </Button>
    </Link>
  );
}