// src/components/admin/student-detail/PaymentList.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Eye } from 'lucide-react';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { formatCurrency } from '@/lib/formatters';
// R.A.K.A.N's FIX: Replaced the server-side Prisma type with our new, client-safe type.
import { ClientPayment } from '../AdminStudentDetail';

interface PaymentListProps {
  payments: ClientPayment[];
  onViewDetails: (paymentId: string) => void;
}

export function PaymentList({ payments, onViewDetails }: PaymentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History ({payments.length})</CardTitle>
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
                      Created At:{' '}
                      {new Date(payment.createdAt).toLocaleDateString('en-US')}
                    </span>
                    {payment.completedAt && (
                      <span>
                        Completed At:{' '}
                        {new Date(payment.completedAt).toLocaleDateString('en-US')}
                      </span>
                    )}
                    {payment.paymobTransactionId && (
                      <span>Transaction ID: {payment.paymobTransactionId}</span>
                    )}
                  </div>
                  {payment.failureReason && (
                    <p className="text-xs text-red-600 mt-1">
                      Failure Reason: {payment.failureReason}
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
                    Details
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}