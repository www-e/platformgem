// src/app/admin/payments/page.tsx
import { Metadata } from 'next';
import AdminPaymentManagement from '@/components/admin/AdminPaymentManagement';

export const metadata: Metadata = {
  title: 'إدارة المدفوعات - لوحة التحكم',
  description: 'إدارة ومراقبة جميع المدفوعات في النظام',
};

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
        <p className="text-muted-foreground">
          مراقبة وإدارة جميع المدفوعات والمعاملات في النظام
        </p>
      </div>
      
      <AdminPaymentManagement />
    </div>
  );
}