// src/components/student/payment-history/TransactionsList.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CreditCard,
  Calendar,
  Eye
} from 'lucide-react';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';
import { 
  getStatusBadge, 
  getPaymentMethodIcon, 
  formatCurrency, 
  formatDateArabic, 
  formatPaymentMethod 
} from '@/lib/payment-utils';
import type { PaymentTransaction } from '@/hooks/usePaymentHistory';

interface TransactionsListProps {
  transactions: PaymentTransaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleViewDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {getPaymentMethodIcon(transaction.paymentMethod)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{transaction.courseName}</h3>
                    <p className="text-sm text-muted-foreground">
                      رقم المعاملة: {transaction.transactionId}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDateArabic(transaction.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="capitalize">{formatPaymentMethod(transaction.paymentMethod)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  {getStatusBadge(transaction.status)}
                  
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  
                  {transaction.refundReason && (
                    <p className="text-xs text-red-600">
                      سبب الاسترداد: {transaction.refundReason}
                    </p>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(transaction.id)}
                    className="mt-2"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    التفاصيل
                  </Button>
                </div>
              </div>
            ))}
            
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد معاملات مطابقة للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </>
  );
}