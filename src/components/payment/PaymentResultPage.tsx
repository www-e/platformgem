// src/components/payment/PaymentResultPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  CreditCard
} from 'lucide-react';
import { CourseWithMetadata } from '@/types/course';
import { formatCoursePrice } from '@/lib/course-utils';
import { toast } from 'sonner';

interface PaymentResultPageProps {
  course: CourseWithMetadata;
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    createdAt: Date;
    completedAt?: Date | null;
    failureReason?: string | null;
    paymobTransactionId?: number | null;
  };
  enrollment?: {
    id: string;
    enrolledAt: Date;
  } | null;
  resultStatus: 'success' | 'pending' | 'failed';
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function PaymentResultPage({ 
  course, 
  payment, 
  enrollment, 
  resultStatus,
  user 
}: PaymentResultPageProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(resultStatus);

  // Auto-refresh for pending payments
  useEffect(() => {
    if (currentStatus === 'pending') {
      const interval = setInterval(async () => {
        await checkPaymentStatus();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [currentStatus]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/${payment.id}/status`);
      const result = await response.json();

      if (result.success && result.data) {
        const newStatus = result.data.status;
        
        if (newStatus === 'COMPLETED' && currentStatus !== 'success') {
          setCurrentStatus('success');
          toast.success('تم الدفع بنجاح! تم تسجيلك في الدورة.');
        } else if (newStatus === 'FAILED' && currentStatus !== 'failed') {
          setCurrentStatus('failed');
          toast.error('فشلت عملية الدفع.');
        }
      }
    } catch (error) {
      console.error('Failed to check payment status:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkPaymentStatus();
    setIsRefreshing(false);
  };

  const handleGoToCourse = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleRetryPayment = () => {
    router.push(`/courses/${course.id}/payment`);
  };

  const handleBackToCourses = () => {
    router.push('/courses');
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'pending':
      default:
        return <Clock className="w-16 h-16 text-yellow-600" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'success':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusTitle = () => {
    switch (currentStatus) {
      case 'success':
        return 'تم الدفع بنجاح!';
      case 'failed':
        return 'فشلت عملية الدفع';
      case 'pending':
      default:
        return 'عملية الدفع قيد المعالجة';
    }
  };

  const getStatusMessage = () => {
    switch (currentStatus) {
      case 'success':
        if (enrollment) {
          return 'تم تسجيلك في الدورة بنجاح. يمكنك الآن الوصول إلى جميع محتويات الدورة.';
        } else {
          return 'تم الدفع بنجاح. سيتم تسجيلك في الدورة خلال دقائق قليلة.';
        }
      case 'failed':
        return payment.failureReason || 'حدث خطأ أثناء معالجة عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.';
      case 'pending':
      default:
        return 'يتم حالياً معالجة عملية الدفع. قد تستغرق هذه العملية بضع دقائق. سيتم تحديث الصفحة تلقائياً عند اكتمال المعالجة.';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBackToCourses}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة إلى الدورات
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          نتيجة عملية الدفع
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="text-center">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center space-y-4">
                {getStatusIcon()}
                
                <div>
                  <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
                    {getStatusTitle()}
                  </h2>
                  <p className="text-gray-600 max-w-md">
                    {getStatusMessage()}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  {currentStatus === 'success' && (
                    <Button 
                      onClick={handleGoToCourse}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <BookOpen className="w-5 h-5" />
                      الوصول إلى الدورة
                    </Button>
                  )}
                  
                  {currentStatus === 'failed' && (
                    <Button 
                      onClick={handleRetryPayment}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      إعادة المحاولة
                    </Button>
                  )}
                  
                  {currentStatus === 'pending' && (
                    <Button 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                      تحديث الحالة
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                تفاصيل الدورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>الأستاذ: {course.professor.name}</span>
                    <span>{course.lessonCount} درس</span>
                    <span>{course.enrollmentCount} طالب</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          {(currentStatus === 'failed' || currentStatus === 'pending') && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      تحتاج مساعدة؟
                    </h4>
                    <p className="text-blue-800 text-sm mb-3">
                      إذا كنت تواجه مشاكل في عملية الدفع أو لديك أي استفسارات، 
                      يمكنك التواصل مع فريق الدعم الفني.
                    </p>
                    <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      التواصل مع الدعم
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تفاصيل الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المبلغ</span>
                <span className="font-semibold">
                  {formatCoursePrice(payment.amount, payment.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الحالة</span>
                <Badge 
                  variant={currentStatus === 'success' ? 'default' : 
                          currentStatus === 'failed' ? 'destructive' : 'secondary'}
                >
                  {currentStatus === 'success' ? 'مكتمل' :
                   currentStatus === 'failed' ? 'فاشل' : 'قيد المعالجة'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">تاريخ الإنشاء</span>
                <span className="text-sm">
                  {new Date(payment.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              
              {payment.completedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">تاريخ الإكمال</span>
                  <span className="text-sm">
                    {new Date(payment.completedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              )}
              
              {payment.paymobTransactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">رقم المعاملة</span>
                  <span className="text-sm font-mono">
                    {payment.paymobTransactionId}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>المجموع</span>
                <span className="text-primary">
                  {formatCoursePrice(payment.amount, payment.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Status */}
          {enrollment && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">
                  حالة التسجيل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span>مسجل في الدورة</span>
                </div>
                <p className="text-sm text-green-600 mt-2">
                  تم التسجيل في {new Date(enrollment.enrolledAt).toLocaleDateString('ar-EG')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}