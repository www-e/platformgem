// src/components/student/payment-history/PaymentMethodsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { getPaymentMethodIcon, formatCurrency, formatPaymentMethod } from '@/lib/payment-utils';
import type { PaymentMethodStats } from '@/hooks/usePaymentHistory';

interface PaymentMethodsCardProps {
  paymentMethods: PaymentMethodStats[];
}

export function PaymentMethodsCard({ paymentMethods }: PaymentMethodsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          طرق الدفع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentMethods.map((method, index) => (
            <div key={`${method.method}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getPaymentMethodIcon(method.method)}
                <div>
                  <p className="font-medium capitalize">
                    {formatPaymentMethod(method.method)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {method.count} معاملة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  {method.percentage.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(method.totalAmount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}