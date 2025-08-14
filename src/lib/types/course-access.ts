// src/lib/types/course-access.ts
// Unified course access types to eliminate duplication

/**
 * Unified course access result interface
 */
export interface CourseAccessResult {
  hasAccess: boolean;
  reason:
    | 'enrolled'
    | 'free_course'
    | 'admin_access'
    | 'professor_owns'
    | 'payment_required'
    | 'not_published'
    | 'not_found'
    | 'not_authenticated';
  course?: {
    id: string;
    title: string;
    price: any;
    currency: string;
    isPublished: boolean;
    professorId: string;
  };
  enrollment?: {
    id: string;
    progressPercent: number;
    enrolledAt: Date;
    lastAccessedAt?: Date | null;
  };
  payment?: {
    id: string;
    status: string;
    amount: any;
  };
  // Additional fields for enhanced access checking
  accessType?: 'free' | 'paid' | 'enrolled' | 'owner' | 'admin';
  message?: string;
  canEnroll?: boolean;
  requiresPayment?: boolean;
}

/**
 * Access message configuration
 */
export interface AccessMessage {
  title: string;
  description: string;
  actionText?: string;
  actionType?: 'login' | 'payment' | 'enrollment' | 'contact';
}