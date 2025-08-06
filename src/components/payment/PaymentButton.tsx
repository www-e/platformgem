// src/components/payment/PaymentButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Course } from "@/lib/api/courses";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PaymentButtonProps {
  course: Course;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  showPrice?: boolean;
  onPaymentSuccess?: () => void;
}

export function PaymentButton({
  course,
  variant = "default",
  size = "default",
  className = "",
  showPrice = true,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const { isAuthenticated, session } = useAuth();
  const isStudent = session?.user?.isStudent;
  const isAdmin = session?.user?.isAdmin;
  const router = useRouter();

  // Format price for display
  const formatPrice = () => {
    if (!course.price || course.price === 0) {
      return "مجاني";
    }

    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: course.currency || "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(course.price));
  };

  // Handle button click
  const handleClick = () => {
    // Check authentication
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/login");
      return;
    }

    // Check user role
    if (!isStudent && !isAdmin) {
      toast.error("غير مصرح لك بشراء الدورات");
      return;
    }

    // Check if already enrolled
    if (course.isEnrolled) {
      toast.info("أنت مسجل في هذه الدورة بالفعل");
      router.push(`/courses/${course.id}`);
      return;
    }

    // Check if course is free
    if (!course.price || course.price === 0) {
      // Handle free enrollment (would need to implement this)
      toast.info("هذه الدورة مجانية - سيتم تنفيذ التسجيل المباشر");
      return;
    }

    // Navigate to payment page for paid courses
    router.push(`/courses/${course.id}/payment`);
  };

  // Handle payment success (called from payment page)
  const handlePaymentSuccess = () => {
    toast.success("تم الدفع بنجاح! تم تسجيلك في الدورة.");
    onPaymentSuccess?.();
  };

  // Determine button content based on course state
  const getButtonContent = () => {
    if (course.isEnrolled) {
      return {
        icon: <CheckCircle className="w-4 h-4" />,
        text: "مسجل بالفعل",
        disabled: false,
      };
    }

    if (!course.price || course.price === 0) {
      return {
        icon: <UserCheck className="w-4 h-4" />,
        text: "التسجيل مجاناً",
        disabled: false,
      };
    }

    return {
      icon: <CreditCard className="w-4 h-4" />,
      text: showPrice ? `اشتري بـ ${formatPrice()}` : "اشتري الآن",
      disabled: false,
    };
  };

  // Check if user can access the course
  const canAccess = () => {
    if (!isAuthenticated) return false;
    if (!isStudent && !isAdmin) return false;
    return true;
  };

  const buttonContent = getButtonContent();

  return (
    <Button
      variant={course.isEnrolled ? "outline" : variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={buttonContent.disabled || !canAccess()}
    >
      {buttonContent.icon}
      {buttonContent.text}
    </Button>
  );
}

// Simplified version for quick use
export function BuyNowButton({
  course,
  onPaymentSuccess,
}: {
  course: Course;
  onPaymentSuccess?: () => void;
}) {
  return (
    <PaymentButton
      course={course}
      variant="default"
      size="lg"
      className="w-full"
      showPrice={true}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}

// Compact version for course cards
export function CompactPaymentButton({
  course,
  onPaymentSuccess,
}: {
  course: Course;
  onPaymentSuccess?: () => void;
}) {
  return (
    <PaymentButton
      course={course}
      variant="outline"
      size="sm"
      showPrice={false}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}
