// src/components/payment/PaymentButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Prisma } from '@prisma/client'; // Import Prisma to use Decimal type
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  CheckCircle,
  UserCheck,
  Play, // Added for enrolled state
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define a more specific type for the course prop
interface PaymentButtonCourseProps {
  id: string;
  title: string;
  price: Prisma.Decimal | number | null; // Accept Decimal or number
  currency: string;
  isEnrolled?: boolean; // Prop for enrollment status
}
interface PaymentButtonProps {
  course: PaymentButtonCourseProps;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  className?: string;
  showPrice?: boolean;
  onPaymentSuccess?: () => void;
}

export function PaymentButton({
  course,
  variant = "primary",
  size = "default",
  className = "",
  showPrice = true,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const { isAuthenticated, session } = useAuth();
  const isStudent = session?.user?.isStudent;
  const isAdmin = session?.user?.isAdmin;
  const router = useRouter();

  // Convert Decimal to number for calculations and comparisons
  const coursePriceNumber = typeof course.price === 'number' 
  ? course.price ?? 0 
  : course.price ? course.price.toNumber() : 0;
  const formatPrice = () => {
    if (coursePriceNumber === 0) {
      return "مجاني";
    }

    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: course.currency || "EGP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(coursePriceNumber);
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      router.push("/login");
      return;
    }

    if (!isStudent && !isAdmin) {
      toast.error("غير مصرح لك بشراء الدورات");
      return;
    }

    if (course.isEnrolled) {
      router.push(`/courses/${course.id}`);
      return;
    }

    if (coursePriceNumber === 0) {
      // Handle free enrollment logic here or in another function
      toast.info("هذه الدورة مجانية - سيتم تنفيذ التسجيل المباشر");
      // Example: enrollInFreeCourse(course.id).then(...)
      return;
    }

    router.push(`/courses/${course.id}/payment`);
  };

  const getButtonContent = () => {
    if (course.isEnrolled) {
      return {
        icon: <Play className="w-4 h-4" />,
        text: "اذهب إلى الدورة",
        disabled: false,
      };
    }

    if (coursePriceNumber === 0) {
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

  const buttonContent = getButtonContent();

  return (
    <Button
      variant={course.isEnrolled ? "secondary" : variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={buttonContent.disabled}
    >
      {buttonContent.icon}
      <span className="mr-2">{buttonContent.text}</span>
    </Button>
  );
}

// Simplified versions can remain, but they need to pass the correct props.
// We'll assume the parent components will provide the necessary `isEnrolled` property.
export function BuyNowButton({
  course,
  onPaymentSuccess,
}: {
  course: PaymentButtonCourseProps;
  onPaymentSuccess?: () => void;
}) {
  return (
    <PaymentButton
      course={course}
      variant="primary"
      size="lg"
      className="w-full"
      showPrice={true}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
}