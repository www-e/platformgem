// src/components/landing/FeaturesSection.tsx
import { BrainCircuit, Trophy, Video, Users, Zap, Target, BookOpen, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Enhanced Bento Card Component
const BentoFeatureCard = ({ 
  className, 
  title, 
  description,
  icon: Icon,
  badgeText,
  accentColor = "primary",
  children
}: { 
  className?: string;
  title: string; 
  description: string;
  icon: React.ElementType;
  badgeText?: string;
  accentColor?: "primary" | "secondary" | "success" | "warning";
  children?: React.ReactNode;
}) => (
  <div className={cn(
    "group relative p-6 rounded-2xl border border-neutral-200/50 bg-white/60 backdrop-blur-sm card-hover-effect overflow-hidden",
    "hover:border-primary/20 hover:shadow-glow transition-all duration-300",
    className
  )}>
    {/* Background Gradient */}
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
      accentColor === "primary" && "bg-gradient-to-br from-primary-50/50 to-primary-100/30",
      accentColor === "secondary" && "bg-gradient-to-br from-secondary-50/50 to-secondary-100/30",
      accentColor === "success" && "bg-gradient-to-br from-emerald-50/50 to-emerald-100/30",
      accentColor === "warning" && "bg-gradient-to-br from-amber-50/50 to-amber-100/30"
    )} />
    
    {/* Content */}
    <div className="relative z-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shadow-elevation-2 group-hover:shadow-elevation-3 transition-all duration-300",
            accentColor === "primary" && "bg-gradient-to-br from-primary-400 to-primary-500 text-black",
            accentColor === "secondary" && "bg-gradient-to-br from-secondary-400 to-secondary-500 text-black",
            accentColor === "success" && "bg-gradient-to-br from-emerald-400 to-emerald-500 text-black",
            accentColor === "warning" && "bg-gradient-to-br from-amber-400 to-amber-500 text-black"
          )}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800 font-display leading-arabic-tight mb-1">
              {title}
            </h3>
            {badgeText && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-neutral-100 text-neutral-700 border-0"
              >
                {badgeText}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-neutral-600 leading-arabic-relaxed mb-4 text-base">
        {description}
      </p>

      {/* Custom content area */}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  </div>
);

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-gradient-to-b from-white to-neutral-50/50">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            مميزات استثنائية
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-arabic-tight">
            <span className="text-neutral-800">لماذا تختار</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              منصتنا التعليمية؟
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-arabic-relaxed">
            نحن نركز على الجودة والكفاءة لنقدم لك تجربة تعليمية فريدة من نوعها تضمن تحقيق أهدافك الأكاديمية
          </p>
        </div>

        {/* Modern Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-4 gap-6 auto-rows-[280px]">
          
          {/* Main Feature - Spans large area */}
          <BentoFeatureCard 
            className="lg:col-span-8 lg:row-span-2" 
            title="منهج مُعد بخبرة واحترافية" 
            description="محتوى تعليمي مُصمم خصيصًا ليتوافق مع أحدث المناهج الدراسية مع التركيز على المفاهيم الأساسية وتطبيقاتها العملية"
            icon={BrainCircuit}
            badgeText="منهج متطور"
            accentColor="primary"
          >
            {/* Visual mockup for curriculum */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200/50">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-neutral-700">الفصل الأول: المفاهيم الأساسية</span>
                  <Badge variant="secondary" className="mr-auto text-xs">مكتمل</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                  <span className="text-sm font-medium text-neutral-700">الفصل الثاني: التطبيقات العملية</span>
                  <Badge variant="outline" className="mr-auto text-xs">قيد التطوير</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full"></div>
                  <span className="text-sm font-medium text-neutral-500">الفصل الثالث: المراجعة النهائية</span>
                  <Badge variant="outline" className="mr-auto text-xs">قريباً</Badge>
                </div>
              </div>
            </div>
          </BentoFeatureCard>

          {/* Interactive Videos */}
          <BentoFeatureCard 
            className="lg:col-span-4 lg:row-span-1" 
            title="شروحات فيديو تفاعلية" 
            description="دروس عالية الجودة تجعل المواد الصعبة سهلة الفهم"
            icon={Video}
            badgeText="HD جودة"
            accentColor="secondary"
          >
            <div className="flex items-center justify-center mt-4 p-3 bg-neutral-800 rounded-lg">
              <Video className="w-8 h-8 text-black/60" />
            </div>
          </BentoFeatureCard>

          {/* Student Tracking */}
          <BentoFeatureCard 
            className="lg:col-span-4 lg:row-span-1" 
            title="متابعة تحقيق التفوق" 
            description="نظام متكامل لتتبع تقدمك مع اختبارات دورية"
            icon={Trophy}
            accentColor="warning"
          >
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>نسبة الإنجاز</span>
                <span className="font-bold">87%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full w-[87%]"></div>
              </div>
            </div>
          </BentoFeatureCard>

          {/* Expert Support */}
          <BentoFeatureCard 
            className="lg:col-span-5 lg:row-span-2" 
            title="دعم مباشر من الخبراء" 
            description="تواصل مباشر مع المعلمين المتخصصين للحصول على إجابات فورية لأسئلتك ومساعدة شخصية"
            icon={Users}
            badgeText="24/7 دعم"
            accentColor="success"
          >
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-black text-sm font-bold">
                  م
                </div>
                <div className="flex-1">
                  <p className="text-sm text-emerald-800 font-medium">المعلم متاح الآن</p>
                  <p className="text-xs text-emerald-600 mt-1">متوسط زمن الرد: دقيقتان</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-neutral-600">+500 سؤال تم الإجابة عليه هذا الشهر</p>
              </div>
            </div>
          </BentoFeatureCard>

          {/* Certificates */}
          <BentoFeatureCard 
            className="lg:col-span-3 lg:row-span-1" 
            title="شهادات معتمدة" 
            description="احصل على شهادة معتمدة عند إتمام الدورة بنجاح"
            icon={Award}
            accentColor="warning"
          >
            <div className="mt-4 flex justify-center">
              <div className="w-16 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <Award className="w-8 h-8 text-black" />
              </div>
            </div>
          </BentoFeatureCard>

        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-primary font-medium">
            <Target className="w-5 h-5" />
            <span>كل هذه المميزات وأكثر في انتظارك</span>
          </div>
        </div>
      </div>
    </section>
  );
}
