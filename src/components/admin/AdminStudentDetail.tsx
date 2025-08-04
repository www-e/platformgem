// src/components/admin/AdminStudentDetail.tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { StudentDetailHeader } from './student-detail/StudentDetailHeader';
import { StudentStats } from './student-detail/StudentStats';
import { StudentContactInfo } from './student-detail/StudentContactInfo';
import { StudentDataTabs } from './student-detail/StudentDataTabs';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';

// Keep the props interface as it defines the shape of the data for this page
interface StudentDetailProps {
  student: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    studentId: string | null;
    isActive: boolean;
    createdAt: Date;
    enrollments: Array<any>; // Using 'any' to match original, but should be typed
    payments: Array<any>;
    certificates: Array<any>;
  };
}

/**
 * Main container component for the student detail page.
 * It manages state and orchestrates the rendering of modular sub-components.
 */
export default function AdminStudentDetail({ student }: StudentDetailProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('تم حذف الطالب بنجاح');
        // Redirect after successful deletion
        window.location.href = '/admin/students';
      } else {
        toast.error(result.error?.message || 'فشل في حذف الطالب');
      }
    } catch (error) {
      console.error('Delete student failed:', error);
      toast.error('حدث خطأ في حذف الطالب');
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
          `تم ${student.isActive ? 'إلغاء تفعيل' : 'تفعيل'} الطالب بنجاح`
        );
        window.location.reload(); // Reload to reflect status change
      } else {
        toast.error(result.error?.message || 'فشل في تحديث حالة الطالب');
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

      {/* The modal remains controlled by the main container component */}
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