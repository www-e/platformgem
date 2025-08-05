// src/app/admin/students/[studentId]/page.tsx

import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import AdminStudentDetail from '@/components/admin/AdminStudentDetail';

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
    title: student ? `${student.name} - إدارة الطلاب` : 'طالب غير موجود',
    description: student ? `إدارة بيانات الطالب ${student.name}` : 'الطالب المطلوب غير موجود',
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

  // Transform data to handle Decimal serialization
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
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null
    }))
  };

  return <AdminStudentDetail student={transformedStudent} />;
}