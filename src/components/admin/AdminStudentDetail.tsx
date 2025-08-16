// src/components/admin/AdminStudentDetail.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { StudentDetailHeader } from './student-detail/StudentDetailHeader';
import { StudentStats } from './student-detail/StudentStats';
import { StudentContactInfo } from './student-detail/StudentContactInfo';
import { StudentDataTabs } from './student-detail/StudentDataTabs';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';
import { PaymentStatus, UserRole, CertificateStatus } from '@prisma/client';

// Define client-safe types for props
export type ClientCertificate = {
  id: string;
  certificateCode: string;
  status: CertificateStatus;
  issuedAt: Date;
  course: {
    title: string;
  };
};

export type ClientPayment = {
  id: string;
  amount: number;
  status: PaymentStatus;
  createdAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
  paymobTransactionId: number | null;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
  };
};

// FIX: Added the 'user' property to match the expected type in EnrollmentList
export type ClientEnrollment = {
  id: string;
  progressPercent: number;
  enrolledAt: Date;
  totalWatchTime: number;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    price: number | null;
    currency: string;
    professor: {
      name: string;
    };
  };
  // This user property is required by the EnrollmentWithCourseDetails type
  user: {
      id: string;
      name: string;
  };
};

export type ClientStudent = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  studentId: string | null;
  isActive: boolean;
  createdAt: Date;
  role: UserRole;
  enrollments: ClientEnrollment[];
  payments: ClientPayment[];
  certificates: ClientCertificate[];
};

interface StudentDetailProps {
  student: ClientStudent;
}

export default function AdminStudentDetail({ student }: StudentDetailProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('تم حذف الملتحق بنجاح');
        window.location.href = '/admin/students';
      } else {
        toast.error(result.error?.message || 'فشل في حذف الملتحق');
      }
    } catch (error) {
      console.error('Delete student failed:', error);
      toast.error('حدث خطأ في حذف الملتحق');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !student.isActive }),
      });
      const result = await response.json();

      if (result.success) {
        toast.success(
          `تم ${student.isActive ? 'إلغاء تفعيل' : 'تفعيل'} الملتحق بنجاح`
        );
        window.location.reload();
      } else {
        toast.error(result.error?.message || 'فشل في تحديث حالة الملتحق');
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
      toast.error('حدث خطأ في تحديث الحالة');
    }
  };

  const handleViewPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <StudentDetailHeader
        student={student}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteStudent}
      />
      <StudentStats
        enrollmentsCount={student.enrollments.length}
        certificatesCount={student.certificates.length}
        payments={student.payments}
      />
      <StudentContactInfo student={student} />
      <StudentDataTabs
        studentData={student}
        onViewPaymentDetails={handleViewPaymentDetails}
      />
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </div>
  );
}