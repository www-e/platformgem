// src/app/payments/return/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

function PaymentReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
  const [paymentData, setPaymentData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const courseId = searchParams.get('course');
  const paymentStatus = searchParams.get('status');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        // Validate required parameters
        if (!courseId) {
          setStatus('failed');
          setError('معلومات الدورة غير متوفرة');
          return;
        }

        // Set status based on URL parameter
        if (paymentStatus === 'success') {
          setStatus('success');
          toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
        } else if (paymentStatus === 'failed') {
          setStatus('failed');
          toast.error('فشلت عملية الدفع.');
        } else {
          // If no status parameter, check payment status
          await checkPaymentStatus();
        }
      } catch (err) {
        console.error('Payment return error:', err);
        setStatus('failed');
        setError('حدث خطأ أثناء معالجة نتيجة الدفع');
      }
    };

    handlePaymentReturn();
  }, [courseId, paymentStatus]);

  const checkPaymentStatus = async () => {
    try {
      if (!courseId) {
        setStatus('failed');
        setError('معلومات الدورة غير متوفرة');
        return;
      }

      // Check payment status via API
      const response = await fetch(`/api/payments/check-status?courseId=${courseId}`);
      const result = await response.json();

      if (result.success) {
        const { status: paymentStatus, paymentId } = result.data;
        
        if (paymentStatus === 'COMPLETED') {
          setStatus('success');
          setPaymentData(result.data);
          toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
        } else if (paymentStatus === 'FAILED') {
          setStatus('failed');
          setError(result.data.failureReason || 'فشلت عملية الدفع');
        } else {
          // Still pending, check again in a few seconds
          setTimeout(checkPaymentStatus, 3000);
        }
      } else {
        setStatus('failed');
        setError(result.error?.message || 'فشل في التحقق من حالة الدفع');
      }
    } catch (err) {
      console.error('Failed to check payment status:', err);
      setStatus('failed');
      setError('فشل في التحقق من حالة الدفع');
    }
  };

  const handleGoToCourse = () => {
    if (courseId) {
      router.push(`/courses/${courseId}`);
    }
  };

  const handleRetryPayment = () => {
    if (courseId) {
      router.push(`/courses/${courseId}/payment`);
    }
  };

  const handleBackToCourses = () => {
    router.push('/courses');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'pending':
        return <Clock className="w-16 h-16 text-yellow-600" />;
      case 'loading':
      default:
        return <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      case 'loading':
      default:
        return 'text-blue-600';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'success':
        return 'تم الدفع بنجاح!';
      case 'failed':
        return 'فشلت عملية الدفع';
      case 'pending':
        return 'عملية الدفع قيد المعالجة';
      case 'loading':
      default:
        return 'جاري معالجة النتيجة...';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'تم تسجيلك في الدورة بنجاح. يمكنك الآن الوصول إلى جميع محتويات الدورة.';
      case 'failed':
        return error || 'حدث خطأ أثناء معالجة عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.';
      case 'pending':
        return 'يتم حالياً معالجة عملية الدفع. قد تستغرق هذه العملية بضع دقائق.';
      case 'loading':
      default:
        return 'جاري معالجة نتيجة الدفع...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={handleBackToCourses}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة إلى الدورات
        </Button>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            نتيجة عملية الدفع
          </h1>
          <p className="text-gray-600">
            نتائج معالجة عملية الدفع الخاصة بك
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-6">
              {getStatusIcon()}
              
              <div className="text-center">
                <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
                  {getStatusTitle()}
                </h2>
                <p className="text-gray-600 max-w-md">
                  {getStatusMessage()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {status === 'success' && (
                  <Button 
                    onClick={handleGoToCourse}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    الوصول إلى الدورة
                  </Button>
                )}
                
                {status === 'failed' && (
                  <Button 
                    onClick={handleRetryPayment}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    إعادة المحاولة
                  </Button>
                )}
                
                <Button 
                  variant="outline"
                  onClick={handleBackToCourses}
                  size="lg"
                >
                  <ArrowLeft className="w-5 h-5 ml-2" />
                  العودة للدورات
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {transactionId && (
          <div className="mt-6 text-center text-sm text-gray-500">
            رقم المعاملة: {transactionId}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentReturnLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">جاري تحميل النتائج...</h2>
        <p className="text-gray-600">يرجى الانتظار بينما نعالج نتيجة الدفع الخاصة بك</p>
      </div>
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<PaymentReturnLoading />}>
      <PaymentReturnContent />
    </Suspense>
  );
}