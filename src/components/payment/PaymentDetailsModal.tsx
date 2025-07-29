// src/components/payment/PaymentDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Calendar,
  Hash,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Receipt,
  User,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDetailsModalProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentDetails {
  id: string;
  status: string;
  statusMessage: string;
  amount: number;
  currency: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  paymobTransactionId?: number;
  paymobOrderId?: string;
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    professor: string;
  };
  enrollment?: {
    id: string;
    enrolledAt: string;
    progressPercent: number;
  };
  webhooks?: Array<{
    id: string;
    transactionId: number;
    processedAt: string;
    processingAttempts: number;
    lastError?: string;
  }>;
}

export default function PaymentDetailsModal({ 
  paymentId, 
  isOpen, 
  onClose 
}: PaymentDetailsModalProps) {
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (paymentId && isOpen) {
      fetchPaymentDetails();
    }
  }, [paymentId, isOpen]);

  const fetchPaymentDetails = async () => {
    if (!paymentId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/payments/${paymentId}/status`);
      const result = await response.json();

      if (result.success) {
        setPaymentDetails(result.data);
      } else {
        toast.error('فشل في تحميل تفاصيل الدفع');
      }
    } catch (error) {
      console.error('Failed to fetch payment details:', error);
      toast.error('حدث خطأ في تحميل التفاصيل');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">فاشل</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">ملغي</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">معلق</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            تفاصيل عملية الدفع
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : paymentDetails ? (
          <div className="space-y-6">
            {/* Status Section */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(paymentDetails.status)}
                <div>
                  <h3 className="font-semibold">حالة الدفع</h3>
                  <p className="text-sm text-gray-600">{paymentDetails.statusMessage}</p>
                </div>
              </div>
              {getStatusBadge(paymentDetails.status)}
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                معلومات الدفع
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">المبلغ</label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-lg">
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: paymentDetails.currency
                      }).format(paymentDetails.amount)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{new Date(paymentDetails.createdAt).toLocaleString('ar-SA')}</span>
                  </div>
                </div>

                {paymentDetails.completedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">تاريخ الإكمال</label>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{new Date(paymentDetails.completedAt).toLocaleString('ar-SA')}</span>
                    </div>
                  </div>
                )}

                {paymentDetails.paymobTransactionId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">رقم المعاملة</label>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{paymentDetails.paymobTransactionId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(
                          paymentDetails.paymobTransactionId!.toString(), 
                          'رقم المعاملة'
                        )}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {paymentDetails.failureReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">سبب الفشل</p>
                      <p className="text-sm text-red-700">{paymentDetails.failureReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Course Information */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                معلومات الدورة
              </h4>
              
              <div className="flex items-center gap-4 p-4 border rounded-lg">
                <img
                  src={paymentDetails.course.thumbnailUrl}
                  alt={paymentDetails.course.title}
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-semibold">{paymentDetails.course.title}</h5>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {paymentDetails.course.professor}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/courses/${paymentDetails.course.id}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  عرض الدورة
                </Button>
              </div>
            </div>

            {/* Enrollment Status */}
            {paymentDetails.enrollment && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    حالة التسجيل
                  </h4>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">مسجل في الدورة</p>
                        <p className="text-sm text-green-600">
                          تاريخ التسجيل: {new Date(paymentDetails.enrollment.enrolledAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          {paymentDetails.enrollment.progressPercent}%
                        </p>
                        <p className="text-sm text-green-600">التقدم</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Technical Details (for debugging) */}
            {paymentDetails.webhooks && paymentDetails.webhooks.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-600">تفاصيل تقنية</h4>
                  
                  <div className="space-y-2">
                    {paymentDetails.webhooks.map((webhook) => (
                      <div key={webhook.id} className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                        <div className="flex justify-between">
                          <span>معالجة: {new Date(webhook.processedAt).toLocaleString('ar-SA')}</span>
                          <span>محاولات: {webhook.processingAttempts}</span>
                        </div>
                        {webhook.lastError && (
                          <p className="text-red-600 mt-1">خطأ: {webhook.lastError}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">لا يمكن تحميل تفاصيل الدفع</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}