// src/components/admin/student-detail/StudentDataTabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentList } from './EnrollmentList';
import { PaymentList } from './PaymentList';
import { CertificateList } from './CertificateList';
// R.A.K.A.N's FIX: Removed server-side imports and will use the client-safe types from props.
import { ClientEnrollment, ClientPayment, ClientCertificate } from '../AdminStudentDetail';

// R.A.K.A.N's FIX: Updated this type alias to use the correct client-side data shapes.
type StudentData = {
  enrollments: ClientEnrollment[];
  payments: ClientPayment[];
  certificates: ClientCertificate[];
};

interface StudentDataTabsProps {
  studentData: StudentData;
  onViewPaymentDetails: (paymentId: string) => void;
}

export function StudentDataTabs({
  studentData,
  onViewPaymentDetails,
}: StudentDataTabsProps) {
  return (
    <Tabs defaultValue="enrollments" className="w-full">
      <TabsList>
        <TabsTrigger value="enrollments">الدورات المسجل بها</TabsTrigger>
        <TabsTrigger value="payments">سجل المدفوعات</TabsTrigger>
        <TabsTrigger value="certificates">الشهادات</TabsTrigger>
      </TabsList>
      <TabsContent value="enrollments" className="pt-4">
        <EnrollmentList enrollments={studentData.enrollments} />
      </TabsContent>
      <TabsContent value="payments" className="pt-4">
        <PaymentList
          payments={studentData.payments}
          onViewDetails={onViewPaymentDetails}
        />
      </TabsContent>
      <TabsContent value="certificates" className="pt-4">
        <CertificateList certificates={studentData.certificates} />
      </TabsContent>
    </Tabs>
  );
}