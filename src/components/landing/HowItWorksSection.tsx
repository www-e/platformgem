// src/components/landing/HowItWorksSection.tsx
import { UserPlus, BookCheck, Rocket } from "lucide-react";

const Step = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="relative flex flex-col items-center text-center">
    <div className="relative flex items-center justify-center w-20 h-20 bg-card rounded-full border-2 border-primary mb-4 z-10">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-xs">{children}</p>
  </div>
);

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">كيف تعمل المنصة؟</h2>
          <p className="text-muted-foreground mt-4">ابدأ رحلتك التعليمية في ثلاث خطوات بسيطة فقط.</p>
        </div>
        <div className="relative">
          <div className="absolute top-10 left-0 w-full h-0.5 bg-border -z-0" />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-16">
            <Step icon={<UserPlus className="w-10 h-10 text-primary" />} title="1. إنشاء حساب">
              سجل بياناتك بسهولة وأمان للوصول الفوري إلى كافة ميزات المنصة التعليمية.
            </Step>
            <Step icon={<BookCheck className="w-10 h-10 text-primary" />} title="2. اختر دورتك">
              تصفح الدورات المتاحة لمرحلتك الدراسية وسجل في المادة التي ترغب في دراستها.
            </Step>
            <Step icon={<Rocket className="w-10 h-10 text-primary" />} title="3. ابدأ التعلم">
              شاهد المحاضرات، حل الواجبات، وتابع تقدمك نحو تحقيق أعلى الدرجات.
            </Step>
          </div>
        </div>
      </div>
    </section>
  );
}