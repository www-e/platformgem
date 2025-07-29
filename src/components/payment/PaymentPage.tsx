// src/components/payment/PaymentPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock,
  BookOpen,
  Users,
  Award,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CourseWithMetadata } from '@/types/course';
import { formatCoursePrice, formatCourseDuration } from '@/lib/course-utils';
import { toast } from 'sonner';

interface PaymentPageProps {
  course: CourseWithMetadata;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function PaymentPage({ course, user }: PaymentPageProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!course.price) {
      toast.error('خطأ في بيانات السعر');
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Initiate payment with Paymob
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlText = await response.text();
        console.error('Received HTML instead of JSON:', htmlText.substring(0, 500));
        throw new Error('الخادم أرجع صفحة HTML بدلاً من JSON. تحقق من حالة الخادم.');
      }

      const result = await response.json();
      console.log('Payment API response:', result);

      if (result.success && result.data && result.data.iframeUrl) {
        // Redirect to Paymob payment page
        window.location.href = result.data.iframeUrl;
      } else {
        console.error('Payment initiation failed:', result);
        throw new Error(result.error?.message || result.error || 'فشل في إنشاء رابط الدفع');
      }

    } catch (error) {
      console.error('Payment initiation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في عملية الدفع';
      setPaymentError(errorMessage);
      toast.error('فشل في بدء عملية الدفع: ' + errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToCourse = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={handleBackToCourse}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة إلى الدورة
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          إتمام عملية الدفع
        </h1>
        <p className="text-gray-600">
          أكمل عملية الدفع للحصول على وصول كامل للدورة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info Card */}
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
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      <span>{course.professor.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.lessonCount} درس</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatCourseDuration(course.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.enrollmentCount} طالب</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Get */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                ما ستحصل عليه
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>وصول مدى الحياة لجميع محتويات الدورة</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>مشاهدة الفيديوهات بجودة عالية</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>تتبع التقدم وحفظ موضع المشاهدة</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>شهادة إتمام الدورة</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>الوصول من أي جهاز (كمبيوتر، هاتف، تابلت)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    دفع آمن ومحمي
                  </h4>
                  <p className="text-blue-800 text-sm">
                    جميع المعاملات محمية بتشفير SSL وتتم معالجتها عبر بوابة دفع آمنة. 
                    لن نحتفظ بأي معلومات بطاقة ائتمان على خوادمنا.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                ملخص الدفع
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>سعر الدورة</span>
                <span className="font-semibold">
                  {formatCoursePrice(course.price, course.currency)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>المجموع</span>
                <span className="text-primary">
                  {formatCoursePrice(course.price, course.currency)}
                </span>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{paymentError}</span>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    ادفع الآن
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                بالنقر على "ادفع الآن" فإنك توافق على شروط الخدمة وسياسة الخصوصية
              </p>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">طرق الدفع المقبولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline" className="justify-center py-2">
                  Visa
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  Mastercard
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  فوري
                </Badge>
                <Badge variant="outline" className="justify-center py-2">
                  محفظة موبايل
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}