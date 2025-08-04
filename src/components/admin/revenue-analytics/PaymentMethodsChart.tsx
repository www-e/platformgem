// src/components/admin/revenue-analytics/PaymentMethodsChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/revenue-analytics-utils";
import type { PaymentMethodStats } from "@/hooks/useRevenueAnalytics";

interface PaymentMethodsChartProps {
  paymentMethods: PaymentMethodStats[];
}

export function PaymentMethodsChart({ paymentMethods }: PaymentMethodsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          طرق الدفع
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div key={method.method} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{method.method}</span>
                <span className="text-sm text-muted-foreground">
                  {method.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${method.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{method.count} معاملة</span>
                <span>
                  {formatCurrency(method.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}