// src/components/admin/student-detail/StudentStats.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, CreditCard, Award, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface StudentStatsProps {
  enrollmentsCount: number;
  certificatesCount: number;
  payments: Array<{
    amount: number;
    status: string;
  }>;
}

/**
 * Renders the grid of 4 key statistic cards for a student.
 */
export function StudentStats({
  enrollmentsCount,
  certificatesCount,
  payments,
}: StudentStatsProps) {
  const totalSpent = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedPayments = payments.filter(
    (p) => p.status === 'COMPLETED'
  ).length;

  const successRate =
    payments.length > 0
      ? ((completedPayments / payments.length) * 100).toFixed(1) + '%'
      : '0%';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{enrollmentsCount}</div>
          <p className="text-xs text-muted-foreground">دورة مسجل بها</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground">
            {completedPayments} دفعة مكتملة
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الشهادات المكتسبة</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{certificatesCount}</div>
          <p className="text-xs text-muted-foreground">شهادة تم الحصول عليها</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">معدل نجاح الدفع</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{successRate}</div>
          <p className="text-xs text-muted-foreground">من إجمالي المدفوعات</p>
        </CardContent>
      </Card>
    </div>
  );
}