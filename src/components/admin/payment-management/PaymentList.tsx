// src/components/admin/payment-management/PaymentList.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { Payment } from '@/hooks/useAdminPayments';
import { PaymentListItem } from './PaymentListItem';

interface PaymentListProps {
  payments: Payment[];
  totalPayments: number;
  isLoading: boolean;
  onViewDetails: (paymentId: string) => void;
  onAction: (
    paymentId: string,
    action: string,
    additionalData?: any
  ) => void;
}

export function PaymentList({
  payments,
  totalPayments,
  isLoading,
  onViewDetails,
  onAction,
}: PaymentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>المدفوعات ({totalPayments})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && payments.length === 0 ? (
          // Skeleton loader for the list
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border rounded-lg animate-pulse">
                <div className="w-24 h-16 bg-muted rounded-md"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
                <div className="w-24 space-y-2">
                  <div className="h-6 bg-muted rounded w-full"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <PaymentListItem
                key={payment.id}
                payment={payment}
                onViewDetails={onViewDetails}
                onAction={onAction}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-12">
            <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">لا توجد مدفوعات</h3>
            <p className="text-muted-foreground">
              لا توجد مدفوعات مطابقة لمعايير البحث الحالية.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}