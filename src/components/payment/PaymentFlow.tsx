// src/components/payment/PaymentFlow.tsx
"use client";

import { useState, useEffect } from "react";
import { Course } from "@/lib/api/courses";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentIframe } from "./PaymentIframe";
import { PaymentStatus } from "./PaymentStatus";
import { CourseInfo } from "./CourseInfo";
import { paymentsApi, PaymentInitiationResponse } from "@/lib/api/payments";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentFlowProps {
  course: Course;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

type PaymentStep =
  | "method-selection"
  | "processing"
  | "iframe"
  | "verifying"
  | "success"
  | "error";
type PaymentMethod = "credit-card" | "e-wallet";

export function PaymentFlow({ course, onSuccess, onCancel }: PaymentFlowProps) {
  const [step, setStep] = useState<PaymentStep>("method-selection");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [paymentData, setPaymentData] =
    useState<PaymentInitiationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset state when component mounts
  useEffect(() => {
    setStep("method-selection");
    setPaymentData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleInitiatePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStep("processing");

      console.log(
        "Initiating payment for course:",
        course.id,
        "with method:",
        selectedMethod
      );

      const response = await paymentsApi.initiatePayment(
        course.id,
        selectedMethod
      );
      console.log("Payment initiation response:", response);

      setPaymentData(response);
      setStep("iframe");
    } catch (error: any) {
      console.error("Payment initiation error:", error);
      const errorMessage = paymentsApi.handlePaymentError(error);
      setError(errorMessage);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentId: string) => {
    try {
      setStep("verifying");

      const payment = await paymentsApi.pollPaymentStatus(paymentId, {
        maxAttempts: 30,
        intervalMs: 3000,
        onStatusChange: (status) => {
          console.log("Payment status update:", status);
        },
      });

      if (payment.status === "COMPLETED") {
        setStep("success");
        toast.success("تم الدفع بنجاح! تم تسجيلك في الدورة.");
        setTimeout(() => {
          onSuccess(paymentId);
        }, 2000);
      } else {
        setError("فشل في إتمام عملية الدفع");
        setStep("error");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setError("انتهت مهلة انتظار تأكيد الدفع");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("method-selection");
    setError(null);
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
            <div>
              <h1 className="text-xl font-bold">إتمام عملية الدفع</h1>
              <p className="text-sm text-muted-foreground">
                اختر طريقة الدفع المناسبة لك
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info Sidebar */}
          <div className="lg:col-span-1">
            <CourseInfo course={course} />
          </div>

          {/* Payment Content */}
          <div className="lg:col-span-2">
            {step === "method-selection" && (
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
                onProceed={handleInitiatePayment}
                isLoading={isLoading}
                course={course}
              />
            )}

            {step === "processing" && (
              <PaymentStatus
                type="processing"
                title="جاري تحضير عملية الدفع"
                message="يرجى الانتظار بينما نحضر نموذج الدفع..."
              />
            )}

            {step === "iframe" && paymentData && (
              <PaymentIframe
                paymentData={paymentData}
                paymentMethod={selectedMethod}
                onComplete={handlePaymentComplete}
                onError={(error: string) => {
                  setError(error);
                  setStep("error");
                }}
              />
            )}

            {step === "verifying" && (
              <PaymentStatus
                type="verifying"
                title="جاري التحقق من عملية الدفع"
                message="يرجى الانتظار بينما نتحقق من حالة الدفع..."
                paymentData={paymentData}
              />
            )}

            {step === "success" && (
              <PaymentStatus
                type="success"
                title="تم الدفع بنجاح!"
                message="تم تسجيلك في الدورة بنجاح. سيتم توجيهك قريباً..."
              />
            )}

            {step === "error" && (
              <PaymentStatus
                type="error"
                title="فشل في عملية الدفع"
                message={error || "حدث خطأ أثناء معالجة عملية الدفع"}
                onRetry={handleRetry}
                onCancel={onCancel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
