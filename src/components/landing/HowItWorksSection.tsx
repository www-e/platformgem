// src/components/landing/HowItWorksSection.tsx
'use client';

import { useState } from 'react';
import { UserPlus, BookCheck, Rocket, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Step {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
  accentColor: string;
  bgGradient: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "إنشاء حساب",
    description: "سجل بياناتك بسهولة وأمان للوصول الفوري إلى كافة ميزات المنصة التعليمية",
    icon: UserPlus,
    details: [
      "تسجيل سريع في أقل من دقيقة",
      "حماية كاملة لبياناتك الشخصية",
      "تفعيل فوري للحساب"
    ],
    accentColor: "from-blue-400 to-blue-600",
    bgGradient: "from-blue-50/50 to-blue-100/30"
  },
  {
    number: 2,
    title: "اختر دورتك",
    description: "تصفح الدورات المتاحة لمرحلتك الدراسية وسجل في المادة التي ترغب في دراستها",
    icon: BookCheck,
    details: [
      "مجموعة واسعة من المواد الدراسية",
      "محتوى مُحدث باستمرار",
      "معاينة مجانية لكل دورة"
    ],
    accentColor: "from-primary-400 to-primary-600",
    bgGradient: "from-primary-50/50 to-primary-100/30"
  },
  {
    number: 3,
    title: "ابدأ التعلم",
    description: "شاهد المحاضرات، حل الواجبات، وتابع تقدمك نحو تحقيق أعلى الدرجات",
    icon: Rocket,
    details: [
      "محاضرات عالية الجودة",
      "واجبات تفاعلية ومتابعة دورية",
      "شهادات إتمام معتمدة"
    ],
    accentColor: "from-secondary-400 to-secondary-600",
    bgGradient: "from-secondary-50/50 to-secondary-100/30"
  }
];

const StepCard = ({ 
  step, 
  isActive, 
  onClick 
}: { 
  step: Step; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <div 
    className={cn(
      "relative group cursor-pointer transition-all duration-500",
      isActive ? "transform scale-105" : "hover:transform hover:scale-102"
    )}
    onClick={onClick}
  >
    {/* Connection Line - Desktop only */}
    {step.number < 3 && (
      <div className="hidden lg:block absolute top-16 -right-8 w-16 h-0.5 bg-gradient-to-r from-neutral-300 to-neutral-200 z-0">
        <div 
          className={cn(
            "h-full bg-gradient-to-r transition-all duration-700",
            isActive ? "w-full from-primary-400 to-primary-500" : "w-0"
          )}
        />
      </div>
    )}

    {/* Main Card */}
    <div className={cn(
      "relative p-8 rounded-3xl border transition-all duration-500 group-hover:shadow-elevation-4",
      isActive 
        ? "bg-white/80 backdrop-blur-sm border-primary/20 shadow-elevation-3 ring-2 ring-primary/10" 
        : "bg-white/60 backdrop-blur-sm border-neutral-200/50 shadow-elevation-2 hover:border-primary/20"
    )}>
      
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500",
        isActive && `bg-gradient-to-br ${step.bgGradient} opacity-100`
      )} />

      {/* Content */}
      <div className="relative z-10">
        
        {/* Step Number & Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-elevation-2 transition-all duration-300",
            isActive 
              ? `bg-gradient-to-br ${step.accentColor} text-black shadow-elevation-3` 
              : "bg-neutral-100 text-neutral-600 group-hover:bg-gradient-to-br group-hover:from-primary-400 group-hover:to-primary-500 group-hover:text-black"
          )}>
            <step.icon className="w-8 h-8" />
          </div>
          
          <div>
            <Badge className={cn(
              "mb-2 transition-all duration-300",
              isActive 
                ? "bg-primary/10 text-primary-700 border-primary/20" 
                : "bg-neutral-100 text-neutral-600 border-neutral-200"
            )}>
              الخطوة {step.number}
            </Badge>
            <h3 className="text-2xl font-bold font-display leading-arabic-tight text-neutral-800">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-neutral-600 leading-arabic-relaxed mb-6 text-lg">
          {step.description}
        </p>

        {/* Details List */}
        <div className="space-y-3">
          {step.details.map((detail, index) => (
            <div 
              key={index}
              className={cn(
                "flex items-start gap-3 transition-all duration-300",
                isActive ? "opacity-100" : "opacity-70 group-hover:opacity-90"
              )}
            >
              <CheckCircle className={cn(
                "w-5 h-5 mt-0.5 transition-colors",
                isActive ? "text-primary-500" : "text-neutral-400 group-hover:text-primary-500"
              )} />
              <span className="text-neutral-700 text-sm leading-arabic-normal">
                {detail}
              </span>
            </div>
          ))}
        </div>

        {/* Active State Indicator */}
        {isActive && (
          <div className="mt-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>هذه هي خطوتك الحالية</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(1);

  // Auto-advance steps every 4 seconds
  useState(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => prev === 3 ? 1 : prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  });

  return (
    <section id="how-it-works" className="section-padding bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 relative overflow-hidden">
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-primary-200/40 to-primary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-secondary-200/40 to-secondary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Enhanced section header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" />
            خطوات بسيطة للنجاح
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-arabic-tight">
            <span className="text-neutral-800">كيف تبدأ رحلتك</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              التعليمية معنا؟
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-arabic-relaxed">
            ابدأ رحلتك التعليمية في ثلاث خطوات بسيطة فقط واحصل على تجربة تعليمية متكاملة تضمن نجاحك الأكاديمي
          </p>
        </div>

        {/* Interactive Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {steps.map((step) => (
            <StepCard
              key={step.number}
              step={step}
              isActive={activeStep === step.number}
              onClick={() => setActiveStep(step.number)}
            />
          ))}
        </div>

        {/* Step Navigation Dots */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span className="text-sm text-neutral-500 font-medium">خطوة</span>
          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  activeStep === step.number
                    ? "bg-primary-500 w-8"
                    : "bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-neutral-500">من {steps.length}</span>
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <div className="glass-medium rounded-3xl p-12 shadow-elevation-4 border border-white/30 max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-neutral-800 font-display mb-4 leading-arabic-tight">
                هل أنت مستعد للبدء؟
              </h3>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-arabic-relaxed">
                انضم إلى مئات الطلاب الذين بدأوا رحلتهم معنا وحققوا نتائج استثنائية في دراستهم
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/signup">
                <Button 
                  size="xl" 
                  className="h-14 px-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-bold rounded-xl shadow-elevation-3 hover:shadow-elevation-4 btn-hover-effect relative overflow-hidden group min-w-[220px]"
                >
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <span>ابدأ رحلتك الآن</span>
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">A</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">S</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">M</div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">انضم إلى +500 طالب</p>
                  <p className="text-xs text-neutral-500">بدأوا بالفعل</p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-neutral-200/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary-600 font-display">100%</div>
                  <div className="text-sm text-neutral-600">ضمان استرداد المال</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-secondary-600 font-display">24/7</div>
                  <div className="text-sm text-neutral-600">دعم فني متاح</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary-600 font-display">فوري</div>
                  <div className="text-sm text-neutral-600">وصول للمحتوى</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
