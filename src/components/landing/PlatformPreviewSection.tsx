// src/components/landing/PlatformPreviewSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Smartphone, Tv, CheckCircle2, Award, PlayCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// A reusable card component for the bento grid
const BentoCard = ({ 
  className, 
  title, 
  children, 
  icon: Icon,
  badgeText
}: { 
  className?: string;
  title: string; 
  children: React.ReactNode;
  icon: React.ElementType;
  badgeText?: string;
}) => (
  <Card className={cn(
    "bg-white/50 backdrop-blur-sm border-neutral-200/50 card-hover-effect flex flex-col group",
    className
  )}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
        </div>
        {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
      </div>
    </CardHeader>
    <CardContent className="flex-grow flex items-center justify-center p-4">
      {children}
    </CardContent>
  </Card>
);

export default function PlatformPreviewSection() {
  return (
    <section id="platform-preview" className="py-20 sm:py-32 px-4 bg-neutral-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-neutral-800">
            تجربة تعليمية متكاملة
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
            نظرة سريعة على الأدوات والميزات التي صممناها لمساعدتك على التفوق والنجاح.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_auto_auto] gap-6 auto-rows-[250px]">
          <BentoCard 
            className="md:col-span-2 md:row-span-2" 
            title="محاضرات فيديو تفاعلية" 
            icon={PlayCircle}
            badgeText="جودة عالية"
          >
            {/* Mockup for a video player */}
            <div className="w-full h-full bg-neutral-100 rounded-md flex flex-col items-center justify-center p-4 border border-neutral-200">
              <div className="w-full bg-neutral-200 h-8 rounded-t-md flex items-center px-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
              </div>
              <div className="w-full flex-grow bg-neutral-800 rounded-b-md flex items-center justify-center">
                 <PlayCircle className="w-16 h-16 text-white/20" strokeWidth={1}/>
              </div>
            </div>
          </BentoCard>

          <BentoCard 
            title="متابعة فورية للتقدم" 
            icon={BarChart3}
          >
             <div className="w-full h-full bg-neutral-100 rounded-md p-4 flex flex-col justify-center gap-3 border border-neutral-200">
                <div className="flex justify-between text-sm"><span>إكمال الدورة</span><span className="font-semibold">75%</span></div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full w-[75%]"></div></div>
                <div className="flex justify-between text-sm"><span>الواجبات</span><span className="font-semibold">8/10</span></div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5"><div className="bg-secondary h-2.5 rounded-full w-[80%]"></div></div>
             </div>
          </BentoCard>

          <BentoCard 
            title="متوافق مع كل الأجهزة" 
            icon={Smartphone}
          >
            <div className="w-full h-full rounded-md flex items-center justify-center gap-8 p-4">
                <Smartphone className="w-12 h-12 md:w-16 md:h-16 text-neutral-300" strokeWidth={1.5}/>
                <Tv className="w-16 h-16 md:w-24 md:h-24 text-neutral-300" strokeWidth={1.5}/>
            </div>
          </BentoCard>

          <BentoCard 
            title="شهادات معتمدة" 
            icon={Award}
          >
             <div className="w-full h-full bg-neutral-100 rounded-md p-4 flex flex-col items-center justify-center border border-neutral-200">
                <Award className="w-12 h-12 text-yellow-500 mb-2" />
                <p className="font-semibold text-center">شهادة إتمام</p>
                <p className="text-xs text-muted-foreground text-center">لكل دورة تكملها بنجاح</p>
             </div>
          </BentoCard>

          <BentoCard 
            className="md:col-span-2" 
            title="مجتمع تفاعلي للطلاب" 
            icon={Users}
          >
             <div className="w-full h-full bg-neutral-100 rounded-md p-4 flex items-center justify-center gap-4 border border-neutral-200">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg">A</div>
                  <p className="text-sm mt-1">أحمد</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center text-pink-600 font-bold text-lg">S</div>
                  <p className="text-sm mt-1">سارة</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-lg">M</div>
                  <p className="text-sm mt-1">محمد</p>
                </div>
             </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}