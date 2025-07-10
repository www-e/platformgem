// src/components/landing/PlatformPreviewSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Smartphone, Tv, CheckCircle2 } from "lucide-react";

const BentoCard = ({ className, title, children }: { className?: string, title: string, children: React.ReactNode }) => (
  <Card className={`bg-card/70 backdrop-blur-sm border-border card-hover-effect flex flex-col ${className}`}>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex-grow flex items-center justify-center p-4">
      {children}
    </CardContent>
  </Card>
);

export default function PlatformPreviewSection() {
  return (
    <section id="platform-preview" className="py-20 sm:py-32 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">نظرة داخل المنصة</h2>
          <p className="text-muted-foreground mt-4">تجربة تعليمية مصممة لتكون سهلة، فعالة، ومتاحة في كل وقت.</p>
        </div>
        {/* The grid is now responsive and flows naturally */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:gap-6 auto-rows-[250px]">
          <BentoCard className="md:col-span-2" title="محاضرات فيديو عالية الجودة">
            <div className="w-full h-full bg-muted/50 rounded-md flex items-center justify-center p-4">
              <Tv className="w-16 h-16 text-muted-foreground/30" strokeWidth={1}/>
            </div>
          </BentoCard>
          <BentoCard title="متابعة فورية للتقدم">
             <div className="w-full h-full bg-muted/50 rounded-md p-4 flex flex-col justify-center gap-2">
                <BarChart3 className="w-10 h-10 text-primary mb-2"/>
                <div className="w-full bg-border rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full w-[75%]"></div></div>
                <p className="text-sm text-muted-foreground">75% مكتمل</p>
             </div>
          </BentoCard>
          <BentoCard title="اختبارات تفاعلية">
             <div className="w-full h-full bg-muted/50 rounded-md p-4 flex flex-col justify-center text-right gap-2">
                <p className="text-sm font-semibold">ما هي عاصمة مصر؟</p>
                <div className="flex items-center gap-2 text-sm p-2 bg-border rounded-md"><CheckCircle2 className="w-4 h-4 text-secondary"/> القاهرة</div>
                <div className="flex items-center gap-2 text-sm p-2 bg-border/50 rounded-md"> الجيزة</div>
             </div>
          </BentoCard>
          <BentoCard className="md:col-span-2" title="متوافق مع كل الأجهزة">
            <div className="w-full h-full bg-muted/50 rounded-md flex items-center justify-center gap-8 p-4">
                <Smartphone className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30" strokeWidth={1}/>
                <Tv className="w-16 h-16 md:w-24 md:h-24 text-muted-foreground/30" strokeWidth={1}/>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  );
}