// src/components/student/payment-history/MonthlySpendingCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/payment-utils';
import type { MonthlySpending } from '@/hooks/usePaymentHistory';

interface MonthlySpendingCardProps {
  monthlySpending: MonthlySpending[];
}

export function MonthlySpendingCard({ monthlySpending }: MonthlySpendingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          الإنفاق الشهري
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {monthlySpending.map((month, index) => (
            <div key={`${month.month}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{month.month}</p>
                <p className="text-sm text-muted-foreground">
                  {month.transactions} معاملة
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(month.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}