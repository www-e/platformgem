// src/lib/course-access.ts
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface CourseAccessResult {
  hasAccess: boolean;
  reason: 'enrolled' | 'free_course' | 'admin_access' | 'professor_owns' | 'payment_required' | 'not_published' | 'not_found' | 'not_authenticated';
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
  };
  payment?: {
    id: string;
    status: string;
    amount: any;
  };
}

/**
 * Check if a user has access to a specific course
 */
export async function checkCourseAccess(courseId: string): Promise<CourseAccessResult> {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return {
        hasAccess: false,
        reason: 'not_authenticated'
      };
    }

    // Get course information
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        isPublished: true,
        professorId: true
      }
    });

    if (!course) {
      return {
        hasAccess: false,
        reason: 'not_found'
      };
    }

    // Check if course is published (admins and professors can access unpublished courses)
    if (!course.isPublished && session.user.role === 'STUDENT') {
      return {
        hasAccess: false,
        reason: 'not_published',
        course
      };
    }

    // Admin access - admins can access any course
    if (session.user.role === 'ADMIN') {
      return {
        hasAccess: true,
        reason: 'admin_access',
        course
      };
    }

    // Professor owns course - professors can access their own courses
    if (session.user.role === 'PROFESSOR' && course.professorId === session.user.id) {
      return {
        hasAccess: true,
        reason: 'professor_owns',
        course
      };
    }

    // Free course access - anyone can access free courses
    if (!course.price || Number(course.price) <= 0) {
      // Check if user is enrolled (for progress tracking)
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId
          }
        },
        select: {
          id: true,
          progressPercent: true,
          enrolledAt: true
        }
      });

      return {
        hasAccess: true,
        reason: 'free_course',
        course,
        enrollment: enrollment || undefined
      };
    }

    // Paid course access - check enrollment and payment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      },
      select: {
        id: true,
        progressPercent: true,
        enrolledAt: true
      }
    });

    if (enrollment) {
      // User is enrolled, check if there's a successful payment
      const payment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          courseId,
          status: 'COMPLETED'
        },
        select: {
          id: true,
          status: true,
          amount: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        hasAccess: true,
        reason: 'enrolled',
        course,
        enrollment,
        payment: payment || undefined
      };
    }

    // No enrollment found for paid course
    return {
      hasAccess: false,
      reason: 'payment_required',
      course
    };

  } catch (error) {
    console.error('Course access check error:', error);
    return {
      hasAccess: false,
      reason: 'not_found'
    };
  }
}

/**
 * Get access message for display to users
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
        actionText: 'ابدأ التعلم',
        actionType: 'enrollment'
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
      const price = result.course?.price ? 
        new Intl.NumberFormat('ar-EG', {
          style: 'currency',
          currency: result.course.currency || 'EGP',
          minimumFractionDigits: 0
        }).format(Number(result.course.price)) : '';

      return {
        title: 'دورة مدفوعة',
        description: `هذه دورة مدفوعة بسعر ${price}. يجب شراء الدورة للوصول إلى المحتوى.`,
        actionText: `اشتري بـ ${price}`,
        actionType: 'payment'
      };

    case 'not_published':
      return {
        title: 'دورة غير منشورة',
        description: 'هذه الدورة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
        actionText: 'تواصل مع الدعم',
        actionType: 'contact'
      };

    case 'not_authenticated':
      return {
        title: 'يجب تسجيل الدخول',
        description: 'يجب تسجيل الدخول أولاً للوصول إلى محتوى الدورة.',
        actionText: 'تسجيل الدخول',
        actionType: 'login'
      };

    case 'not_found':
    default:
      return {
        title: 'الدورة غير موجودة',
        description: 'لم يتم العثور على الدورة المطلوبة.',
        actionText: 'تصفح الدورات',
        actionType: 'contact'
      };
  }
}

/**
 * Middleware function for protecting course routes
 */
export async function requireCourseAccess(courseId: string) {
  const accessResult = await checkCourseAccess(courseId);
  
  if (!accessResult.hasAccess) {
    throw new Error(`Course access denied: ${accessResult.reason}`);
  }
  
  return accessResult;
}

/**
 * Check if user can enroll in a course (for free courses)
 */
export async function canEnrollInCourse(courseId: string): Promise<{
  canEnroll: boolean;
  reason: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { canEnroll: false, reason: 'not_authenticated' };
    }

    if (!['STUDENT', 'ADMIN'].includes(session.user.role)) {
      return { canEnroll: false, reason: 'invalid_role' };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        price: true,
        isPublished: true,
        professorId: true
      }
    });

    if (!course) {
      return { canEnroll: false, reason: 'course_not_found' };
    }

    if (!course.isPublished) {
      return { canEnroll: false, reason: 'course_not_published' };
    }

    if (course.professorId === session.user.id) {
      return { canEnroll: false, reason: 'own_course' };
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return { canEnroll: false, reason: 'already_enrolled' };
    }

    // For paid courses, check if payment is required
    if (course.price && Number(course.price) > 0) {
      return { canEnroll: false, reason: 'payment_required' };
    }

    return { canEnroll: true, reason: 'eligible' };

  } catch (error) {
    console.error('Enrollment check error:', error);
    return { canEnroll: false, reason: 'error' };
  }
}

/**
 * Enroll user in a free course
 */
export async function enrollInFreeCourse(courseId: string): Promise<{
  success: boolean;
  message: string;
  enrollmentId?: string;
}> {
  try {
    const enrollmentCheck = await canEnrollInCourse(courseId);
    
    if (!enrollmentCheck.canEnroll) {
      return {
        success: false,
        message: getEnrollmentErrorMessage(enrollmentCheck.reason)
      };
    }

    const session = await auth();
    if (!session?.user) {
      return { success: false, message: 'غير مصرح لك بالتسجيل' };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        progressPercent: 0,
        completedLessonIds: [],
        totalWatchTime: 0
      }
    });

    return {
      success: true,
      message: 'تم التسجيل في الدورة بنجاح!',
      enrollmentId: enrollment.id
    };

  } catch (error) {
    console.error('Free course enrollment error:', error);
    return {
      success: false,
      message: 'حدث خطأ أثناء التسجيل في الدورة'
    };
  }
}

/**
 * Get user-friendly error message for enrollment issues
 */
function getEnrollmentErrorMessage(reason: string): string {
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