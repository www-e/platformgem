// src/app/courses/[courseId]/payment/page.tsx
// Payment page for course enrollment

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { EnrollmentService } from '@/lib/services/enrollment-service';
import { CourseService } from '@/lib/services/course-service';
import PaymentPage from '@/components/payment/PaymentPage';

interface CoursePaymentPageProps {
  params: {
    courseId: string;
  };
}

export async function generateMetadata({ params }: CoursePaymentPageProps): Promise<Metadata> {
  const course = await CourseService.getCourseById(params.courseId);
  
  if (!course) {
    return {
      title: 'دورة غير موجودة',
    };
  }

  return {
    title: `الدفع - ${course.title}`,
    description: `إتمام عملية الدفع للتسجيل في دورة ${course.title}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CoursePaymentPage({ params }: CoursePaymentPageProps) {
  const session = await auth();
  
  // Require authentication
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Only students can make payments
  if (session.user.role !== 'STUDENT') {
    redirect('/courses');
  }

  const courseId = params.courseId;

  // Get course details
  const course = await CourseService.getCourseById(courseId, session.user.id, session.user.role);
  
  if (!course) {
    notFound();
  }

  // Check course access
  const accessResult = await EnrollmentService.checkCourseAccess(
    courseId,
    session.user.id,
    session.user.role
  );

  // If already enrolled, redirect to course
  if (accessResult.hasAccess) {
    redirect(`/courses/${courseId}`);
  }

  // If course is free, redirect to free enrollment
  if (!accessResult.requiresPayment) {
    redirect(`/courses/${courseId}`);
  }

  // If cannot enroll, redirect to course catalog
  if (!accessResult.canEnroll) {
    redirect('/courses');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <PaymentPage
          course={course}
          user={{
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            phone: session.user.phone || ''
          }}
        />
      </div>
    </div>
  );
}