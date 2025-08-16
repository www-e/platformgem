// src/app/admin/students/[studentId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import AdminStudentDetail from '@/components/admin/AdminStudentDetail';

// R.A.K.A.N's FIX: Next.js 15 requires params to be a Promise
interface StudentDetailPageProps {
  params: Promise<{ studentId: string }>;
}

export async function generateMetadata({ params }: StudentDetailPageProps): Promise<Metadata> {
  const { studentId } = await params;
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { name: true }
  });

  return {
    title: student ? `${student.name} - إدارة الملتحقين` : 'ملتحق غير موجود',
    description: student ? `إدارة بيانات الملتحق ${student.name}` : 'الملتحق المطلوب غير موجود',
  };
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { studentId } = await params;
  
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true,
              price: true,
              currency: true,
              professor: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      },
      payments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnailUrl: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      certificates: {
        include: {
          course: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          issuedAt: 'desc'
        }
      }
    }
  });

  if (!student || student.role !== 'STUDENT') {
    redirect('/admin/students');
  }

  // R.A.K.A.N's FIX: The transformation logic is now complete. It provides every field
  // required by the new, stricter client-side types, fixing the downstream prop errors.
  const transformedStudent = {
    ...student,
    enrollments: student.enrollments.map(enrollment => ({
      ...enrollment,
      course: {
        ...enrollment.course,
        price: enrollment.course.price ? Number(enrollment.course.price) : null
      }
    })),
    payments: student.payments.map(payment => ({
      ...payment,
      amount: Number(payment.amount),
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
    })),
    certificates: student.certificates.map(certificate => ({
      ...certificate,
      course: {
        title: certificate.course.title,
      }
    }))
  };

  return <AdminStudentDetail student={transformedStudent} />;
}