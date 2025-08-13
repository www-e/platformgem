// src/components/admin/student-detail/StudentDataTabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnrollmentList } from './EnrollmentList';
import { PaymentList } from './PaymentList';
import { CertificateList } from './CertificateList';

// Define a more specific type for the props based on the original component's data structure
type StudentData = {
  enrollments: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  certificates: Record<string, unknown>[];
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