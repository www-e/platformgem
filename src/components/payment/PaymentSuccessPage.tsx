// src/components/payment/PaymentSuccessPage.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle,
  Play,
  Download,
  Share2,
  BookOpen,
  Award,
  Clock,
  Users
} from 'lucide-react';
import { CourseWithMetadata } from '@/types/course';
import { formatCoursePrice, formatCourseDuration } from '@/lib/course-utils';
import { toast } from 'sonner';

interface PaymentSuccessPageProps {
  course: CourseWithMetadata;
  enrollmentResult: {
    success: boolean;
    message: string;
    enrollmentId?: string;
  };
  paymentId: string;
}

export default function PaymentSuccessPage({ 
  course, 
  enrollmentResult, 
  paymentId 
}: PaymentSuccessPageProps) {
  const router = useRouter();

  useEffect(() => {
    if (enrollmentResult.success) {
      toast.success('تم التسجيل في الدورة بنجاح!');
    } else {
      toast.error('حدث خطأ في التسجيل');
    }
  }, [enrollmentResult]);

  const handleStartLearning = () => {
    router.push(`/courses/${course.id}`);
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleShareSuccess = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تسجلت في دورة ${course.title}`,
          text: `انضممت للتو إلى دورة ${course.title} في منصة التعلم الإلكتروني!`,
          url: window.location.origin + `/courses/${course.id}`
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `انضممت للتو إلى دورة ${course.title} في منصة التعلم الإلكتروني! ${window.location.origin}/courses/${course.id}`
        );
        toast.success('تم نسخ الرابط');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  if (!enrollmentResult.success) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-900">
              حدث خطأ في التسجيل
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-red-800">
              تم الدفع بنجاح ولكن حدث خطأ في تسجيلك في الدورة. 
              يرجى التواصل مع الدعم الفني.
            </p>
            <p className="text-sm text-red-700">
              رقم المعاملة: {paymentId}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/support')} variant="outline">
                التواصل مع الدعم
              </Button>
              <Button onClick={handleGoToDashboard}>
                الذهاب للوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 تهانينا!
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          تم الدفع بنجاح وتسجيلك في الدورة
        </p>
        <Badge className="bg-green-100 text-green-800 px-4 py-2">
          رقم المعاملة: {paymentId}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                الدورة التي سجلت بها
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
                      <span>{course.enrollmentCount + 1} طالب</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                ما التالي؟
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">ابدأ التعلم الآن</h4>
                    <p className="text-gray-600 text-sm">
                      يمكنك الآن الوصول لجميع دروس الدورة ومشاهدة الفيديوهات
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">تتبع تقدمك</h4>
                    <p className="text-gray-600 text-sm">
                      سيتم حفظ تقدمك تلقائياً ويمكنك متابعة التعلم من حيث توقفت
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">احصل على الشهادة</h4>
                    <p className="text-gray-600 text-sm">
                      بعد إتمام جميع الدروس ستحصل على شهادة إتمام الدورة
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ابدأ رحلة التعلم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleStartLearning}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                ابدأ التعلم الآن
              </Button>
              
              <Button 
                onClick={handleGoToDashboard}
                variant="outline"
                className="w-full"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                الذهاب للوحة التحكم
              </Button>
              
              <Button 
                onClick={handleShareSuccess}
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                شارك إنجازك
              </Button>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المبلغ المدفوع</span>
                <span className="font-semibold">
                  {formatCoursePrice(course.price, course.currency)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">تاريخ الدفع</span>
                <span className="font-semibold">
                  {new Date().toLocaleDateString('ar-SA')}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">رقم المعاملة</span>
                <span className="font-mono text-sm">
                  {paymentId.slice(-8)}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4 mr-2" />
                طباعة الإيصال
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}