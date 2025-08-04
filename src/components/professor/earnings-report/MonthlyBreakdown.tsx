// src/components/professor/earnings-report/MonthlyBreakdown.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/earnings-utils";
import type { MonthlyEarnings } from "@/hooks/useEarningsReport";

interface MonthlyBreakdownProps {
  monthlyData: MonthlyEarnings[];
}

export function MonthlyBreakdown({ monthlyData }: MonthlyBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          التفصيل الشهري
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{month.month}</p>
                  <p className="text-sm text-muted-foreground">
                    {month.students} طالب جديد • {month.courses} دورة
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(month.earnings)}
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {month.growth >= 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">+{month.growth.toFixed(1)}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      <span className="text-red-600">{month.growth.toFixed(1)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}