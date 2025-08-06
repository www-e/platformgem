// src/app/courses/[courseId]/payment/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { coursesApi, Course } from "@/lib/api/courses";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const courseId = params.courseId as string;
  const paymentId = searchParams.get('paymentId');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await coursesApi.getById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            تم الدفع بنجاح!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            تم تسجيلك في الدورة بنجاح. يمكنك الآن الوصول إلى جميع الدروس.
          </p>

          {course && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                بواسطة: {course.professor.name}
              </p>
            </div>
          )}

          {paymentId && (
            <p className="text-xs text-muted-foreground mb-6">
              رقم العملية: {paymentId}
            </p>
          )}

          <div className="space-y-3">
            <Link href={`/courses/${courseId}`} className="block">
              <Button className="w-full" size="lg">
                <Play className="w-5 h-5 mr-2" />
                ابدأ الدورة الآن
              </Button>
            </Link>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}