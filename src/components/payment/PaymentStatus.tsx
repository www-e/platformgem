// src/components/payment/PaymentStatus.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment, paymentsApi } from "@/lib/api/payments";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  CreditCard,
  Calendar,
  Hash,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface PaymentStatusProps {
  paymentId: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onStatusChange?: (status: Payment['status']) => void;
}

export function PaymentStatus({ 
  paymentId, 
  autoRefresh = false, 
  refreshInterval = 5000,
  onStatusChange 
}: PaymentStatusProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch payment status
  const fetchPaymentStatus = async () => {
    try {
      setError(null);
      const paymentData = await paymentsApi.getPaymentStatus(paymentId);
      setPayment(paymentData);
      setLastUpdated(new Date());
      
      if (onStatusChange && payment?.status !== paymentData.status) {
        onStatusChange(paymentData.status);
      }
    } catch (error) {
      console.error('Error fetching payment status:', error);
      setError(paymentsApi.handlePaymentError(error));
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPaymentStatus();
  }, [paymentId]);

  // Auto refresh for pending payments
  useEffect(() => {
    if (!autoRefresh || !payment || payment.status !== 'PENDING') {
      return;
    }

    const interval = setInterval(fetchPaymentStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, payment?.status, refreshInterval]);

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />;
      case 'REFUNDED':
        return <RefreshCw className="w-6 h-6 text-blue-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusMessage = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return {
          title: 'تم الدفع بنجاح',
          description: 'تم إتمام عملية الدفع وتسجيلك في الدورة',
          color: 'text-green-600'
        };
      case 'FAILED':
        return {
          title: 'فشل في الدفع',
          description: 'لم يتم إتمام عملية الدفع بنجاح',
          color: 'text-red-600'
        };
      case 'PENDING':
        return {
          title: 'في انتظار التأكيد',
          description: 'جاري معالجة عملية الدفع...',
          color: 'text-yellow-600'
        };
      case 'REFUNDED':
        return {
          title: 'تم الاسترداد',
          description: 'تم استرداد المبلغ المدفوع',
          color: 'text-blue-600'
        };
      default:
        return {
          title: 'حالة غير معروفة',
          description: 'حالة الدفع غير واضحة',
          color: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !payment) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2">خطأ في جلب البيانات</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'فشل في جلب معلومات الدفع'}
          </p>
          <Button onClick={fetchPaymentStatus} variant="outline">
            <RefreshCw className="w-4 h-4" />
            حاول مرة أخرى
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusMessage(payment.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {getStatusIcon(payment.status)}
          <div>
            <CardTitle className={`text-lg ${statusInfo.color}`}>
              {statusInfo.title}
            </CardTitle>
            <CardDescription>
              {statusInfo.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4" />
              <span>المبلغ</span>
            </div>
            <div className="text-lg font-semibold">
              {paymentsApi.formatAmount(payment)}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>التاريخ</span>
            </div>
            <div className="text-lg font-semibold">
              {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Hash className="w-4 h-4" />
              <span>رقم العملية</span>
            </div>
            <div className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {payment.id}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge className="w-4 h-4" />
              <span>الحالة</span>
            </div>
            <Badge className={paymentsApi.getStatusColor(payment.status)}>
              {paymentsApi.getStatusText(payment.status)}
            </Badge>
          </div>
        </div>

        {/* Course Information */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">تفاصيل الدورة</h4>
          <div className="flex gap-4">
            <img 
              src={payment.course.thumbnailUrl} 
              alt={payment.course.title}
              className="w-16 h-16 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
              }}
            />
            <div className="flex-1">
              <h5 className="font-medium">{payment.course.title}</h5>
              <p className="text-sm text-muted-foreground">
                بواسطة: {payment.course.professor.name}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {payment.status === 'COMPLETED' && payment.isEnrolled && (
            <Button asChild className="flex-1">
              <Link href={`/courses/${payment.course.id}`}>
                <ExternalLink className="w-4 h-4" />
                الدخول للدورة
              </Link>
            </Button>
          )}

          {payment.status === 'FAILED' && (
            <Button className="flex-1" variant="outline">
              <RefreshCw className="w-4 h-4" />
              حاول الدفع مرة أخرى
            </Button>
          )}

          <Button 
            variant="outline" 
            onClick={fetchPaymentStatus}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-center border-t pt-4">
          آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}
          {autoRefresh && payment.status === 'PENDING' && (
            <span className="ml-2">(يتم التحديث تلقائياً)</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}