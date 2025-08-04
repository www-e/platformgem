// src/components/admin/revenue-analytics/RecentPayments.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";
import { formatCurrencyWithDecimals, formatDate, getPaymentStatusText, getPaymentStatusVariant } from "@/lib/revenue-analytics-utils";
import type { Payment } from "@/hooks/useRevenueAnalytics";

interface RecentPaymentsProps {
  payments: Payment[];
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          المدفوعات الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">{payment.studentName}</p>
                  <p className="text-sm text-muted-foreground">{payment.courseName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {formatCurrencyWithDecimals(payment.amount)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getPaymentStatusVariant(payment.status)}
                  >
                    {getPaymentStatusText(payment.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(payment.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}