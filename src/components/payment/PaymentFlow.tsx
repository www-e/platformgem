// src/components/payment/PaymentFlow.tsx - Enterprise Payment Flow
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Course } from "@/lib/api/courses";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentIframe } from "./PaymentIframe";
import { PaymentStatus } from "./PaymentStatus";
import { CourseInfo } from "./CourseInfo";
import { paymentsApi, PaymentInitiationResponse } from "@/lib/api/payments";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  Lock,
  CheckCircle,
  Clock,
  CreditCard,
  Smartphone,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentFlowProps {
  course: Course;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
}

type PaymentStep = "method" | "details" | "review" | "complete";
type PaymentMethod = "credit-card" | "e-wallet";

const STEPS = [
  { id: "method", title: "طريقة الدفع", icon: CreditCard },
  { id: "details", title: "تفاصيل الدفع", icon: Lock },
  { id: "review", title: "مراجعة الطلب", icon: CheckCircle },
  { id: "complete", title: "إتمام العملية", icon: Shield },
];

export function PaymentFlow({ course, onSuccess, onCancel }: PaymentFlowProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method");
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("credit-card");
  const [paymentData, setPaymentData] =
    useState<PaymentInitiationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processingState, setProcessingState] = useState<
    "idle" | "processing" | "verifying" | "success" | "error"
  >("idle");

  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / STEPS.length) * 100;

  useEffect(() => {
    // Reset state on mount
    setCurrentStep("method");
    setPaymentData(null);
    setError(null);
    setIsLoading(false);
    setProcessingState("idle");
  }, []);

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const handleProceedToDetails = () => {
    setCurrentStep("details");
  };

  const handleInitiatePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProcessingState("processing");

      const response = await paymentsApi.initiatePayment(
        course.id,
        selectedMethod
      );

      setPaymentData(response);
      setCurrentStep("complete");

      setProcessingState("idle");

      console.log("Payment initiated successfully:", {
        paymentId: response.paymentId,
        iframeUrl: response.iframeUrl,
      });
    } catch (error: any) {
      const errorMessage = paymentsApi.handlePaymentError(error);
      setError(errorMessage);
      setProcessingState("error");
      console.error("Payment initiation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentId: string) => {
    try {
      setProcessingState("verifying");

      const payment = await paymentsApi.pollPaymentStatus(paymentId, {
        maxAttempts: 30,
        intervalMs: 3000,
        onStatusChange: (status) => {
          console.log("Payment status:", status);
        },
      });

      if (payment.status === "COMPLETED") {
        setProcessingState("success");
        toast.success("تم الدفع بنجاح! تم تسجيلك في الدورة.");
        setTimeout(() => onSuccess(paymentId), 2000);
      } else {
        setError("فشل في إتمام عملية الدفع");
        setProcessingState("error");
      }
    } catch (error) {
      setError("انتهت مهلة انتظار تأكيد الدفع");
      setProcessingState("error");
    }
  };

  const handleRetry = () => {
    setCurrentStep("method");
    setError(null);
    setPaymentData(null);
    setProcessingState("idle");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Enhanced Header with Trust Indicators */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 ml-2" />
                العودة
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-display">
                  دفع آمن ومحمي
                </h1>
                <p className="text-neutral-600 font-primary">
                  عملية دفع مشفرة بأعلى معايير الأمان
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="w-4 h-4" />
                <span className="font-medium font-primary">SSL محمي</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Lock className="w-4 h-4" />
                <span className="font-medium font-primary">PCI DSS</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium font-primary">ضمان الاسترداد</span>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium font-primary">
                تقدم العملية
              </span>
              <span className="text-sm text-neutral-600 font-primary">
                {currentStepIndex + 1} من {STEPS.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />

            {/* Step Indicators */}
            <div className="flex items-center justify-between mt-4">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary-100 text-primary-700"
                          : isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      <StepIcon className="w-4 h-4" />
                      <span className="font-primary">{step.title}</span>
                      {isCompleted && <CheckCircle className="w-4 h-4" />}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={cn(
                          "w-8 h-0.5 mx-2",
                          isCompleted ? "bg-green-300" : "bg-neutral-200"
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Wide Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Course Info Sidebar */}
          <div className="xl:col-span-1">
            <CourseInfo course={course} />
          </div>

          {/* Payment Content */}
          <div className="xl:col-span-3">
            <AnimatePresence mode="wait">
              {currentStep === "method" && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodSelector
                    selectedMethod={selectedMethod}
                    onMethodSelect={handleMethodSelect}
                    onProceed={handleProceedToDetails}
                    isLoading={isLoading}
                    course={course}
                  />
                </motion.div>
              )}

              {currentStep === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-bold font-display mb-4">
                      تأكيد طريقة الدفع
                    </h2>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                      {selectedMethod === "credit-card" ? (
                        <CreditCard className="w-8 h-8 text-blue-600" />
                      ) : (
                        <Smartphone className="w-8 h-8 text-green-600" />
                      )}
                      <div>
                        <p className="font-semibold font-display">
                          {selectedMethod === "credit-card"
                            ? "بطاقة ائتمان"
                            : "محفظة إلكترونية"}
                        </p>
                        <p className="text-sm text-neutral-600 font-primary">
                          {selectedMethod === "credit-card"
                            ? "دفع آمن باستخدام بطاقة الائتمان أو الخصم"
                            : "دفع سريع باستخدام المحفظة الإلكترونية"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={() => setCurrentStep("method")}
                        variant="outline"
                      >
                        تغيير الطريقة
                      </Button>
                      <Button
                        onClick={handleInitiatePayment}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                            جاري التحضير...
                          </>
                        ) : (
                          "متابعة الدفع"
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === "complete" && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {processingState === "processing" && (
                    <PaymentStatus
                      type="processing"
                      title="جاري تحضير عملية الدفع"
                      message="يرجى الانتظار بينما نحضر نموذج الدفع الآمن..."
                    />
                  )}

                  {processingState === "idle" && paymentData && (
                    <PaymentIframe
                      paymentData={paymentData}
                      paymentMethod={selectedMethod}
                      onComplete={handlePaymentComplete}
                      onError={(error: string) => {
                        setError(error);
                        setProcessingState("error");
                      }}
                    />
                  )}

                  {processingState === "verifying" && (
                    <PaymentStatus
                      type="verifying"
                      title="جاري التحقق من عملية الدفع"
                      message="يرجى الانتظار بينما نتحقق من حالة الدفع..."
                      paymentData={paymentData}
                    />
                  )}

                  {processingState === "success" && (
                    <PaymentStatus
                      type="success"
                      title="تم الدفع بنجاح!"
                      message="تم تسجيلك في الدورة بنجاح. سيتم توجيهك إلى الدورة قريباً..."
                    />
                  )}

                  {processingState === "error" && (
                    <PaymentStatus
                      type="error"
                      title="فشل في عملية الدفع"
                      message={error || "حدث خطأ أثناء معالجة عملية الدفع"}
                      onRetry={handleRetry}
                      onCancel={onCancel}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="font-primary">تشفير SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="font-primary">معتمد PCI DSS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span className="font-primary">ضمان استرداد 30 يوم</span>
              </div>
            </div>

            <div className="text-sm text-neutral-500 font-primary">
              محمي بواسطة تقنيات الأمان المتقدمة
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
