// src/components/admin/payment-management/PaymentListItem.tsx

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  BookOpen,
  Calendar,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { Payment } from '@/hooks/useAdminPayments';
import { PaymentStatusBadge } from '@/components/shared/PaymentStatusBadge';
import { formatCurrency } from '@/lib/formatters';

interface PaymentListItemProps {
  payment: Payment;
  onViewDetails: (paymentId: string) => void;
  onAction: (
    paymentId: string,
    action: string,
    additionalData?: any
  ) => void;
}

export function PaymentListItem({
  payment,
  onViewDetails,
  onAction,
}: PaymentListItemProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={payment.course.thumbnailUrl}
          alt={payment.course.title}
          className="w-24 h-16 object-cover rounded-md hidden sm:block"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{payment.course.title}</h3>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{payment.user.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{payment.course.professor.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(payment.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
          </div>

          {payment.paymobTransactionId && (
            <p className="text-xs text-muted-foreground mt-1">
              رقم المعاملة: {payment.paymobTransactionId}
            </p>
          )}

          {payment.failureReason && (
            <p className="text-xs text-red-600 mt-1">
              سبب الفشل: {payment.failureReason}
            </p>
          )}

          {payment.lastWebhook?.lastError && (
            <p className="text-xs text-orange-600 mt-1">
              خطأ في المعالجة: {payment.lastWebhook.lastError}
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex md:flex-col items-end justify-between md:justify-center w-full md:w-auto text-right gap-2">
        <div className="text-lg font-bold text-primary">
          {formatCurrency(payment.amount)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(payment.id)}
          >
            <Eye className="h-3 w-3 ml-1" />
            التفاصيل
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {payment.status === 'PENDING' && (
                <>
                  <DropdownMenuItem onClick={() => onAction(payment.id, 'manual_complete')}>
                    <CheckCircle className="h-4 w-4 ml-2" />
                    <span>إكمال يدوياً</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => onAction(payment.id, 'update_status', { status: 'failed', reason: 'Cancelled by admin' })}
                  >
                    <XCircle className="h-4 w-4 ml-2" />
                    <span>إلغاء</span>
                  </DropdownMenuItem>
                </>
              )}
              {payment.status === 'COMPLETED' && payment.lastWebhook?.lastError && (
                <DropdownMenuItem onClick={() => onAction(payment.id, 'retry_enrollment')}>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  <span>إعادة محاولة التسجيل</span>
                </DropdownMenuItem>
              )}
              {payment.status === 'FAILED' && (
                <DropdownMenuItem onClick={() => onAction(payment.id, 'manual_complete')}>
                  <CheckCircle className="h-4 w-4 ml-2" />
                  <span>إكمال يدوياً</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}