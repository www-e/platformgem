// src/components/admin/student-detail/PaymentList.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye } from 'lucide-react';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { formatCurrency } from '@/lib/formatters';

interface PaymentListProps {
  payments: any[];
  onViewDetails: (paymentId: string) => void;
}

export function PaymentList({ payments, onViewDetails }: PaymentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجل المدفوعات ({payments.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <img
                  src={payment.course.thumbnailUrl}
                  alt={payment.course.title}
                  className="w-24 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{payment.course.title}</h3>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>
                      تاريخ الإنشاء:{' '}
                      {new Date(payment.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                    {payment.completedAt && (
                      <span>
                        تاريخ الإكمال:{' '}
                        {new Date(payment.completedAt).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                    {payment.paymobTransactionId && (
                      <span>رقم المعاملة: {payment.paymobTransactionId}</span>
                    )}
                  </div>
                  {payment.failureReason && (
                    <p className="text-xs text-red-600 mt-1">
                      سبب الفشل: {payment.failureReason}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div className="text-lg font-bold">
                    {formatCurrency(payment.amount)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(payment.id)}
                  >
                    <Eye className="h-3 w-3 ml-1" />
                    التفاصيل
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مدفوعات</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}