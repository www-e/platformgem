// src/components/course/CourseAccessGuard.tsx
"use client";

import { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PaymentButton } from "@/components/payment/PaymentButton";
import { CourseAccessResult, getAccessMessage } from "@/lib/course-access";
import { checkCourseAccess, enrollInFreeCourse } from "@/lib/api/course-access";
import { 
  Lock, 
  CheckCircle, 
  CreditCard, 
  UserPlus, 
  AlertCircle,
  Shield,
  Crown,
  GraduationCap,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  thumbnailUrl: string;
  isPublished: boolean;
  bunnyLibraryId: string;
  categoryId: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  professor: {
    id: string;
    name: string;
    bio: string | null;
    expertise?: string[];
  };
  _count: {
    lessons: number;
    enrollments: number;
  };
}

interface CourseAccessGuardProps {
  courseId: string;
  course?: Course; // Optional course data to avoid extra API calls
  children: ReactNode;
  fallback?: ReactNode;
  showAccessInfo?: boolean;
}

export function CourseAccessGuard({ 
  courseId, 
  course, 
  children, 
  fallback,
  showAccessInfo = true 
}: CourseAccessGuardProps) {
  const [accessResult, setAccessResult] = useState<CourseAccessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  // const router = useRouter(); // Unused for now

  // Check course access on mount
  useEffect(() => {
    async function checkAccess() {
      try {
        setLoading(true);
        const result = await checkCourseAccess(courseId);
        setAccessResult(result);
      } catch (error) {
        console.error('Access check error:', error);
        setAccessResult({
          hasAccess: false,
          reason: 'not_found'
        });
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [courseId]);

  // Handle free course enrollment
  const handleFreeEnrollment = async () => {
    try {
      setEnrolling(true);
      const result = await enrollInFreeCourse(courseId);
      
      if (result.success) {
        toast.success(result.message);
        // Refresh access check
        const newAccessResult = await checkCourseAccess(courseId);
        setAccessResult(newAccessResult);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    // Refresh access check after successful payment
    const newAccessResult = await checkCourseAccess(courseId);
    setAccessResult(newAccessResult);
  };

  // Get access icon
  const getAccessIcon = (reason: CourseAccessResult['reason']) => {
    switch (reason) {
      case 'enrolled':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'free_course':
        return <GraduationCap className="w-8 h-8 text-blue-600" />;
      case 'admin_access':
        return <Crown className="w-8 h-8 text-purple-600" />;
      case 'professor_owns':
        return <Shield className="w-8 h-8 text-indigo-600" />;
      case 'payment_required':
        return <CreditCard className="w-8 h-8 text-orange-600" />;
      case 'not_authenticated':
        return <Lock className="w-8 h-8 text-gray-600" />;
      default:
        return <AlertCircle className="w-8 h-8 text-red-600" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        {fallback || (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
      </div>
    );
  }

  // No access result
  if (!accessResult) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2">خطأ في التحقق من الوصول</h3>
          <p className="text-muted-foreground">حدث خطأ أثناء التحقق من صلاحية الوصول للدورة</p>
        </CardContent>
      </Card>
    );
  }

  // User has access - show content
  if (accessResult.hasAccess) {
    return (
      <div className="space-y-4">
        {/* Access Info (optional) */}
        {showAccessInfo && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="flex items-center gap-3 py-4">
              {getAccessIcon(accessResult.reason)}
              <div>
                <h4 className="font-semibold text-green-800">
                  {getAccessMessage(accessResult).title}
                </h4>
                <p className="text-sm text-green-700">
                  {getAccessMessage(accessResult).description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Course Content */}
        {children}
      </div>
    );
  }

  // User doesn't have access - show access gate
  const accessMessage = getAccessMessage(accessResult);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getAccessIcon(accessResult.reason)}
          </div>
          <CardTitle className="text-xl">{accessMessage.title}</CardTitle>
          <CardDescription className="text-base">
            {accessMessage.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Course Information */}
          {accessResult.course && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">معلومات الدورة</h4>
              <p className="text-sm text-muted-foreground">
                {accessResult.course.title}
              </p>
              {accessResult.course.price && (
                <p className="text-sm font-medium mt-1">
                  السعر: {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: accessResult.course.currency || 'EGP',
                    minimumFractionDigits: 0
                  }).format(Number(accessResult.course.price))}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {accessMessage.actionType === 'login' && (
              <Button asChild className="flex-1">
                <Link href="/login">
                  <Lock className="w-4 h-4" />
                  {accessMessage.actionText}
                </Link>
              </Button>
            )}

            {accessMessage.actionType === 'payment' && course && (
              <PaymentButton
                course={course}
                className="flex-1"
                size="lg"
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}

            {accessMessage.actionType === 'enrollment' && (
              <Button 
                onClick={handleFreeEnrollment}
                disabled={enrolling}
                className="flex-1"
                size="lg"
              >
                {enrolling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {accessMessage.actionText}
                  </>
                )}
              </Button>
            )}

            {accessMessage.actionType === 'contact' && (
              <Button variant="outline" className="flex-1" size="lg">
                <ExternalLink className="w-4 h-4" />
                {accessMessage.actionText}
              </Button>
            )}
          </div>

          {/* Additional Actions */}
          <div className="flex justify-center">
            <Button variant="ghost" asChild>
              <Link href="/courses">
                العودة إلى الدورات
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fallback Content */}
      {fallback && (
        <div className="opacity-50 pointer-events-none">
          {fallback}
        </div>
      )}
    </div>
  );
}

// Higher-order component for protecting entire pages
export function withCourseAccess<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    courseIdProp?: keyof P;
    fallback?: ReactNode;
    showAccessInfo?: boolean;
  } = {}
) {
  const { courseIdProp = 'courseId', fallback, showAccessInfo = true } = options;

  return function ProtectedComponent(props: P) {
    const courseId = (props as any)[courseIdProp] as string;

    if (!courseId) {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">معرف الدورة مفقود</h3>
            <p className="text-muted-foreground">لم يتم تحديد معرف الدورة</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <CourseAccessGuard
        courseId={courseId}
        fallback={fallback}
        showAccessInfo={showAccessInfo}
      >
        <Component {...props} />
      </CourseAccessGuard>
    );
  };
}