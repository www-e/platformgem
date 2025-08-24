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
  const [courseId, setCourseId] = useState<string | null>(null);

  // Extract PayMob parameters
  const paymobSuccess = searchParams.get('success') === 'true';
  const paymobTransactionId = searchParams.get('id');
  const paymobOrderId = searchParams.get('order');
  const merchantOrderId = searchParams.get('merchant_order_id');
  const amountCents = searchParams.get('amount_cents');
  const currency = searchParams.get('currency');
  const errorOccurred = searchParams.get('error_occured') === 'true';
  
  // Legacy parameters (for backward compatibility)
  const legacyCourseId = searchParams.get('course');
  const legacyStatus = searchParams.get('status');
  const legacyTransactionId = searchParams.get('transactionId');

  useEffect(() => {
    const handlePaymentReturn = async () => {
      try {
        console.log('🔍 Payment return processing:', {
          paymobSuccess,
          paymobTransactionId,
          paymobOrderId,
          merchantOrderId,
          legacyCourseId,
          legacyStatus,
          errorOccurred
        });

        // Extract course ID from merchant_order_id if available
        let extractedCourseId = legacyCourseId;
        if (!extractedCourseId && merchantOrderId) {
          // merchant_order_id format: course_{courseId}_{userId}_{timestamp}_{random}
          const parts = merchantOrderId.split('_');
          if (parts.length >= 2 && parts[0] === 'course') {
            extractedCourseId = parts[1];
            console.log('📋 Course ID extracted from merchant_order_id:', extractedCourseId);
          }
        }

        setCourseId(extractedCourseId);

        // Handle direct PayMob parameters (highest priority)
        if (paymobTransactionId && paymobSuccess !== undefined) {
          if (paymobSuccess && !errorOccurred) {
            console.log('✅ PayMob indicates successful payment');
            await verifyPaymentWithMultipleMethods({
              transactionId: paymobTransactionId,
              orderId: paymobOrderId || undefined,
              merchantOrderId: merchantOrderId || undefined,
              courseId: extractedCourseId
            });
          } else {
            console.log('❌ PayMob indicates failed payment');
            setStatus('failed');
            setError('فشلت عملية الدفع في بوابة الدفع');
            toast.error('فشلت عملية الدفع.');
          }
          return;
        }

        // Handle legacy parameters
        if (legacyStatus === 'success') {
          setStatus('success');
          toast.success('Payment successful! You have been enrolled in the course.');
          return;
        } else if (legacyStatus === 'failed') {
          setStatus('failed');
          setError('فشلت عملية الدفع');
          toast.error('فشلت عملية الدفع.');
          return;
        }

        // Fallback: Try to check payment status if we have any identifier
        if (extractedCourseId || paymobTransactionId || legacyTransactionId) {
          await checkPaymentStatusWithFallback({
            courseId: extractedCourseId,
            transactionId: paymobTransactionId || legacyTransactionId,
            orderId: paymobOrderId,
            merchantOrderId
          });
        } else {
          setStatus('failed');
          setError('لا توجد معلومات كافية للتحقق من حالة الدفع');
        }

      } catch (err) {
        console.error('Payment return error:', err);
        setStatus('failed');
        setError('حدث خطأ أثناء معالجة نتيجة الدفع');
      }
    };

    handlePaymentReturn();
  }, [paymobSuccess, paymobTransactionId, paymobOrderId, merchantOrderId, legacyCourseId, legacyStatus]);

  const verifyPaymentWithMultipleMethods = async (params: {
    transactionId: string;
    orderId?: string;
    merchantOrderId?: string;
    courseId?: string | null;
  }) => {
    console.log('🔍 Verifying payment with multiple methods:', params);
    
    try {
      // Method 1: Check by course ID (legacy method)
      if (params.courseId) {
        const response = await fetch(`/api/payments/check-status?courseId=${params.courseId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.status === 'COMPLETED') {
            console.log('✅ Payment verified via course ID');
            setStatus('success');
            setPaymentData(result.data);
            toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
            return;
          }
        }
      }

      // Method 2: Check by merchant order ID
      if (params.merchantOrderId) {
        const response = await fetch(`/api/payments/check-status?merchantOrderId=${params.merchantOrderId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.status === 'COMPLETED') {
            console.log('✅ Payment verified via merchant order ID');
            setStatus('success');
            setPaymentData(result.data);
            setCourseId(result.data.courseId);
            toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
            return;
          }
        }
      }

      // Method 3: Check by transaction ID
      if (params.transactionId) {
        const response = await fetch(`/api/payments/check-status?transactionId=${params.transactionId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.status === 'COMPLETED') {
            console.log('✅ Payment verified via transaction ID');
            setStatus('success');
            setPaymentData(result.data);
            setCourseId(result.data.courseId);
            toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
            return;
          }
        }
      }

      // If we reach here, payment verification failed
      console.log('❌ Payment verification failed with all methods');
      setStatus('pending');
      
      // Start polling for delayed webhook processing
      setTimeout(() => {
        pollPaymentStatus(params, 0);
      }, 2000);

    } catch (err) {
      console.error('❌ Payment verification error:', err);
      setStatus('failed');
      setError('فشل في التحقق من حالة الدفع');
    }
  };

  const pollPaymentStatus = async (params: {
    transactionId: string;
    orderId?: string;
    merchantOrderId?: string;
    courseId?: string | null;
  }, attempt: number) => {
    const maxAttempts = 10; // Poll for up to 30 seconds (3s intervals)
    
    if (attempt >= maxAttempts) {
      console.log('⏰ Polling timeout reached');
      setStatus('failed');
      setError('انتهت مهلة الانتظار. يرجى التحقق من حالة الدفع لاحقاً');
      return;
    }

    console.log(`🔁 Polling attempt ${attempt + 1}/${maxAttempts}`);
    
    try {
      // Try all verification methods again
      const verificationMethods = [];
      
      if (params.courseId) {
        verificationMethods.push(fetch(`/api/payments/check-status?courseId=${params.courseId}`));
      }
      if (params.merchantOrderId) {
        verificationMethods.push(fetch(`/api/payments/check-status?merchantOrderId=${params.merchantOrderId}`));
      }
      if (params.transactionId) {
        verificationMethods.push(fetch(`/api/payments/check-status?transactionId=${params.transactionId}`));
      }

      const responses = await Promise.allSettled(verificationMethods);
      
      for (const response of responses) {
        if (response.status === 'fulfilled' && response.value.ok) {
          const result = await response.value.json();
          if (result.success && result.data.status === 'COMPLETED') {
            console.log('✅ Payment verified via polling');
            setStatus('success');
            setPaymentData(result.data);
            if (result.data.courseId) {
              setCourseId(result.data.courseId);
            }
            toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
            return;
          }
        }
      }

      // Continue polling
      setTimeout(() => {
        pollPaymentStatus(params, attempt + 1);
      }, 3000);

    } catch (err) {
      console.error(`❌ Polling attempt ${attempt + 1} failed:`, err);
      // Continue polling even on errors
      setTimeout(() => {
        pollPaymentStatus(params, attempt + 1);
      }, 3000);
    }
  };

  const checkPaymentStatusWithFallback = async (params: {
    courseId?: string | null;
    transactionId?: string | null;
    orderId?: string | null;
    merchantOrderId?: string | null;
  }) => {
    console.log('🔍 Fallback payment status check:', params);
    
    // Try course ID first (most reliable)
    if (params.courseId) {
      try {
        const response = await fetch(`/api/payments/check-status?courseId=${params.courseId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const { status: paymentStatus } = result.data;
            
            if (paymentStatus === 'COMPLETED') {
              setStatus('success');
              setPaymentData(result.data);
              toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
              return;
            } else if (paymentStatus === 'FAILED') {
              setStatus('failed');
              setError(result.data.failureReason || 'فشلت عملية الدفع');
              return;
            } else {
              // Still pending, start polling
              setStatus('pending');
              setTimeout(() => pollPaymentStatus({
                transactionId: params.transactionId || '',
                orderId: params.orderId || undefined,
                merchantOrderId: params.merchantOrderId || undefined,
                courseId: params.courseId
              }, 0), 2000);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Course ID check failed:', err);
      }
    }

    // Fallback to other methods
    setStatus('failed');
    setError('لم يتم العثور على بيانات الدفع');
  };

  const handleGoToCourse = () => {
    if (courseId) {
      router.push(`/courses/${courseId}`);
    } else {
      // Fallback: go to courses catalog
      router.push('/courses');
    }
  };

  const handleRetryPayment = () => {
    if (courseId) {
      router.push(`/courses/${courseId}/payment`);
    } else {
      // Fallback: go to courses catalog
      router.push('/courses');
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

        {(paymobTransactionId || legacyTransactionId) && (
          <div className="mt-6 text-center text-sm text-gray-500">
            رقم المعاملة: {paymobTransactionId || legacyTransactionId}
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