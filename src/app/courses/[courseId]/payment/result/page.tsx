// src/app/courses/[courseId]/payment/result/page.tsx
// Payment result page after PayMob redirect

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { CourseService } from '@/lib/services/course/index.service';
import PaymentResultPage from '@/components/payment/PaymentResultPage';
import prisma from '@/lib/prisma';

interface PaymentResultPageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    payment_id?: string;
    transaction_id?: string;
    success?: string;
    pending?: string;
  }>;
}

export async function generateMetadata({ params }: PaymentResultPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await CourseService.getCourseById(courseId);
  
  if (!course) {
    return {
      title: 'نتيجة الدفع',
    };
  }

  return {
    title: `نتيجة الدفع - ${course.title}`,
    description: `نتيجة عملية الدفع للتسجيل في دورة ${course.title}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function CoursePaymentResultPage({ 
  params, 
  searchParams 
}: PaymentResultPageProps) {
  const session = await auth();
  
  // Require authentication
  if (!session?.user?.id) {
    redirect('/login');
  }

  const { courseId } = await params;
  const { payment_id, transaction_id, success, pending } = await searchParams;

  // Get course details
  const course = await CourseService.getCourseById(courseId, session.user.id, session.user.role);
  
  if (!course) {
    notFound();
  }

  // Find payment record
  let payment = null;
  if (payment_id) {
    payment = await prisma.payment.findFirst({
      where: {
        id: payment_id,
        userId: session.user.id,
        courseId: courseId
      },
      include: {
        webhooks: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  } else if (transaction_id) {
    // Try to find by PayMob transaction ID
    payment = await prisma.payment.findFirst({
      where: {
        paymobTransactionId: BigInt(transaction_id),
        userId: session.user.id,
        courseId: courseId
      },
      include: {
        webhooks: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  } else {
    // Try to find the most recent payment for this user and course
    payment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        webhooks: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });
  }

  if (!payment) {
    // No payment found, redirect to course page
    redirect(`/courses/${courseId}`);
  }

  // Check enrollment status
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId
      }
    },
    select: {
      id: true,
      enrolledAt: true
    }
  });

  // Determine result status based on URL params and payment status
  let resultStatus: 'success' | 'pending' | 'failed' = 'pending';
  
  if (success === 'true' || payment.status === 'COMPLETED') {
    resultStatus = 'success';
  } else if (success === 'false' || payment.status === 'FAILED') {
    resultStatus = 'failed';
  } else if (pending === 'true' || payment.status === 'PENDING') {
    resultStatus = 'pending';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <PaymentResultPage
          course={course}
          payment={{
            id: payment.id,
            status: payment.status,
            amount: Number(payment.amount),
            currency: payment.currency,
            createdAt: payment.createdAt,
            completedAt: payment.completedAt,
            failureReason: payment.failureReason,
            paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null
          }}
          enrollment={enrollment}
          resultStatus={resultStatus}
          user={{
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || ''
          }}
        />
      </div>
    </div>
  );
}