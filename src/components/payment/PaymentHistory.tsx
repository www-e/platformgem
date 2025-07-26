// src/components/payment/PaymentHistory.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Payment, paymentsApi } from "@/lib/api/payments";
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Receipt,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

interface PaymentHistoryProps {
  userId?: string; // Optional for admin view
  limit?: number;
  showTitle?: boolean;
}

export function PaymentHistory({ userId, limit, showTitle = true }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock function to fetch payments - replace with actual API call
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be replaced with actual API call
      // const response = await fetch('/api/payments/history');
      // const data = await response.json();
      
      // For now, return empty array
      setPayments([]);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('فشل في جلب تاريخ المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'REFUNDED':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
    const statusText = paymentsApi.getStatusText(status);
    const statusColor = paymentsApi.getStatusColor(status);
    
    return (
      <Badge variant="outline" className={statusColor}>
        {getStatusIcon(status)}
        {statusText}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              تاريخ المدفوعات
            </CardTitle>
            <CardDescription>
              عرض جميع عمليات الدفع السابقة
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="w-16 h-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              تاريخ المدفوعات
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchPayments} variant="outline">
              <RefreshCw className="w-4 h-4" />
              حاول مرة أخرى
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            تاريخ المدفوعات
          </CardTitle>
          <CardDescription>
            عرض جميع عمليات الدفع السابقة
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مدفوعات</h3>
            <p className="text-muted-foreground mb-4">
              لم تقم بأي عمليات دفع حتى الآن
            </p>
            <Button asChild>
              <Link href="/courses">
                <ExternalLink className="w-4 h-4" />
                تصفح الدورات
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.slice(0, limit).map((payment) => (
              <div key={payment.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {/* Course Image */}
                <img 
                  src={payment.course.thumbnailUrl} 
                  alt={payment.course.title}
                  className="w-16 h-16 object-cover rounded-md"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                  }}
                />

                {/* Payment Details */}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{payment.course.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    بواسطة: {payment.course.professor.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                    </div>
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {paymentsApi.formatAmount(payment)}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="text-right space-y-2">
                  {getStatusBadge(payment.status)}
                  
                  {payment.status === 'COMPLETED' && payment.isEnrolled && (
                    <div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/courses/${payment.course.id}`}>
                          <ExternalLink className="w-4 h-4" />
                          الدخول للدورة
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  {payment.status === 'FAILED' && (
                    <div>
                      <Button size="sm" variant="outline">
                        <RefreshCw className="w-4 h-4" />
                        حاول مرة أخرى
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Show More Button */}
            {limit && payments.length > limit && (
              <div className="text-center pt-4 border-t">
                <Button variant="outline">
                  عرض المزيد من المدفوعات
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}