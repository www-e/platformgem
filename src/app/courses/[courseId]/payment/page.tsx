// src/app/courses/[courseId]/payment/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PaymentFlow } from "@/components/payment/PaymentFlow";
// R.A.K.A.N's FIX: Replaced the old 'Course' import with the correct, detailed API type.
import { coursesApi, ApiCourseWithTypedLessons } from "@/lib/api/courses";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  // R.A.K.A.N's FIX: Updated the state to use the new type.
  const [course, setCourse] = useState<ApiCourseWithTypedLessons | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await coursesApi.getById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('فشل في تحميل بيانات الدورة');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handlePaymentSuccess = (paymentId: string) => {
    router.push(`/courses/${courseId}/payment/success?paymentId=${paymentId}`);
  };

  const handlePaymentCancel = () => {
    router.push(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل بيانات الدورة...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'الدورة غير موجودة'}</p>
          <Link href="/courses">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة للدورات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentFlow
        course={course}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
      />
    </div>
  );
}