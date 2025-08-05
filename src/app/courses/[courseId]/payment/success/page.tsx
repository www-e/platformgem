// src/app/courses/[courseId]/payment/success/page.tsx
// Payment success page with automatic enrollment

import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { EnrollmentService } from "@/lib/services/enrollment/core.service";
import { CourseService } from "@/lib/services/course/index.service";
import PaymentSuccessPage from "@/components/payment/PaymentSuccessPage";

interface PaymentSuccessPageProps {
  params: {
    courseId: string;
  };
  searchParams: {
    paymentId?: string;
    success?: string;
  };
}

export const metadata: Metadata = {
  title: "تم الدفع بنجاح",
  description: "تم إتمام عملية الدفع بنجاح وتسجيلك في الدورة",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PaymentSuccessPageRoute({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  const session = await auth();

  // Require authentication
  if (!session?.user?.id) {
    redirect("/login");
  }

  const courseId = params.courseId;
  const paymentId = searchParams.paymentId;
  const success = searchParams.success === "true";

  if (!success || !paymentId) {
    redirect(`/courses/${courseId}/payment`);
  }

  // Get course details
  const course = await CourseService.getCourseById(
    courseId,
    session.user.id,
    session.user.role
  );

  if (!course) {
    notFound();
  }

  // Create enrollment after successful payment
  let enrollmentResult;
  try {
    enrollmentResult = await EnrollmentService.createPaidEnrollment(
      courseId,
      session.user.id,
      paymentId
    );
  } catch (error) {
    console.error("Error creating enrollment after payment:", error);
    enrollmentResult = {
      success: false,
      message: "حدث خطأ في إنشاء التسجيل",
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <PaymentSuccessPage
          course={course}
          enrollmentResult={enrollmentResult}
          paymentId={paymentId}
        />
      </div>
    </div>
  );
}
