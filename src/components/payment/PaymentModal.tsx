// src/components/payment/PaymentModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { paymentsApi, PaymentInitiationResponse } from "@/lib/api/payments";
import { Course } from "@/lib/api/courses";
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

type PaymentStep = 'initiate' | 'processing' | 'iframe' | 'verifying' | 'success' | 'error';

export function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('initiate');
  const [paymentData, setPaymentData] = useState<PaymentInitiationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('initiate');
      setPaymentData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Handle payment initiation
  const handleInitiatePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStep('processing');

      const response = await paymentsApi.initiatePayment(course.id);
      setPaymentData(response);
      setStep('iframe');

      // Create iframe after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (response.iframeUrl) {
          createPaymentIframe(response.iframeUrl);
          startPaymentVerification(response.paymentId);
        }
      }, 500);

    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(paymentsApi.handlePaymentError(error));
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Create PayMob iframe
  const createPaymentIframe = (iframeUrl: string) => {
    const container = document.getElementById('payment-iframe-container');
    if (container) {
      paymentsApi.createPaymentIframe(iframeUrl, 'payment-iframe-container');
    }
  };

  // Start payment verification polling
  const startPaymentVerification = async (paymentId: string) => {
    try {
      setStep('verifying');
      
      const payment = await paymentsApi.pollPaymentStatus(paymentId, {
        maxAttempts: 30,
        intervalMs: 3000,
        onStatusChange: (status) => {
          console.log('Payment status update:', status);
        }
      });

      if (payment.status === 'COMPLETED') {
        setStep('success');
        toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
        setTimeout(() => {
          onSuccess(paymentId);
          onClose();
        }, 2000);
      } else {
        setError('فشل في إتمام عملية الدفع');
        setStep('error');
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      setError('انتهت مهلة انتظار تأكيد الدفع');
      setStep('error');
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (step === 'iframe' || step === 'verifying') {
      // Warn user about closing during payment
      if (confirm('هل أنت متأكد من إغلاق نافذة الدفع؟ قد تفقد عملية الدفع الجارية.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  // Format price for display
  const formatPrice = () => {
    if (!course.price) return 'مجاني';
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(course.price));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            دفع ثمن الدورة
          </DialogTitle>
          <DialogDescription>
            إتمام عملية الدفع للتسجيل في الدورة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Information */}
          <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
            <img 
              src={course.thumbnailUrl} 
              alt={course.title}
              className="w-20 h-20 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
              }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-sm text-muted-foreground">{course.category.name}</p>
              <p className="text-sm text-muted-foreground">بواسطة: {course.professor.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{formatPrice()}</Badge>
                <Badge variant="secondary">{course._count.lessons} درس</Badge>
              </div>
            </div>
          </div>

          {/* Payment Steps */}
          {step === 'initiate' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">تأكيد عملية الدفع</h4>
                <p className="text-muted-foreground">
                  ستتم إعادة توجيهك إلى بوابة الدفع الآمنة لإتمام العملية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-3 border rounded-lg">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-sm font-medium">دفع آمن</p>
                  <p className="text-xs text-muted-foreground">محمي بتشفير SSL</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm font-medium">وصول فوري</p>
                  <p className="text-xs text-muted-foreground">بعد إتمام الدفع</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm font-medium">ضمان الجودة</p>
                  <p className="text-xs text-muted-foreground">محتوى عالي الجودة</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleInitiatePayment}
                  disabled={isLoading}
                  className="flex-1"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري التحضير...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      ادفع {formatPrice()}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose} size="lg">
                  إلغاء
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h4 className="text-lg font-semibold mb-2">جاري تحضير عملية الدفع</h4>
              <p className="text-muted-foreground">يرجى الانتظار...</p>
            </div>
          )}

          {step === 'iframe' && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">أكمل عملية الدفع</h4>
                <p className="text-muted-foreground">
                  استخدم النموذج أدناه لإدخال بيانات الدفع
                </p>
              </div>
              
              <div 
                id="payment-iframe-container" 
                className="border rounded-lg overflow-hidden"
                style={{ minHeight: '500px' }}
              >
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>هذا النموذج محمي ومشفر بواسطة PayMob</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
              <h4 className="text-lg font-semibold mb-2">جاري التحقق من عملية الدفع</h4>
              <p className="text-muted-foreground">
                يرجى الانتظار بينما نتحقق من حالة الدفع...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h4 className="text-xl font-semibold mb-2 text-green-600">تم الدفع بنجاح!</h4>
              <p className="text-muted-foreground mb-4">
                تم تسجيلك في الدورة بنجاح. يمكنك الآن الوصول إلى جميع الدروس.
              </p>
              <Button onClick={onClose} size="lg">
                <CheckCircle className="w-5 h-5" />
                ممتاز
              </Button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h4 className="text-xl font-semibold mb-2 text-red-600">فشل في عملية الدفع</h4>
              <p className="text-muted-foreground mb-4">
                {error || 'حدث خطأ أثناء معالجة عملية الدفع'}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setStep('initiate')} size="lg">
                  <AlertCircle className="w-5 h-5" />
                  حاول مرة أخرى
                </Button>
                <Button variant="outline" onClick={onClose} size="lg">
                  إغلاق
                </Button>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {paymentData && step !== 'success' && step !== 'error' && (
            <div className="text-xs text-muted-foreground text-center border-t pt-4">
              <p>رقم العملية: {paymentData.paymentId}</p>
              <p>المبلغ: {paymentData.amount} {paymentData.currency}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}