// src/components/professor/earnings-report/RecentTransactions.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign } from "lucide-react";
import { formatCurrencyWithDecimals, formatDate, getTransactionStatusText, getTransactionStatusVariant } from "@/lib/earnings-utils";
import type { Transaction } from "@/hooks/useEarningsReport";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          المعاملات الحديثة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.studentName}</p>
                  <p className="text-xs text-muted-foreground truncate">{transaction.courseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">
                  {formatCurrencyWithDecimals(transaction.amount)}
                </p>
                <Badge 
                  variant={getTransactionStatusVariant(transaction.status)}
                  className="text-xs"
                >
                  {getTransactionStatusText(transaction.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}