// src/app/page.tsx

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoveLeft, BrainCircuit, Trophy, Video, Quote, Star } from "lucide-react";
import Link from "next/link";

// Helper component for Feature Cards for cleaner code
const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="bg-card/70 backdrop-blur-sm p-6 rounded-lg border border-border card-hover-effect text-center">
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

// Helper component for Testimonial Cards
const TestimonialCard = ({ quote, name }: { quote: string, name: string }) => (
  <div className="bg-card/70 backdrop-blur-sm p-6 rounded-lg border border-border card-hover-effect">
    <Quote className="w-8 h-8 text-primary mb-4" />
    <p className="text-foreground/90 mb-4 italic">"{quote}"</p>
    <div className="flex items-center justify-between">
      <p className="font-semibold text-primary">{name}</p>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
      </div>
    </div>
  </div>
);


export default function LandingPage() {
  return (
    // The main container is now the AuroraBackground for the hero
    <AuroraBackground>
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 -mt-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-blue-200">
          منصتك الأولى للتميز الدراسي
        </h1>
        <p className="mt-6 max-w-3xl text-lg md:text-xl text-foreground/80">
          نقدم شرحًا متخصصًا ومتابعة دقيقة لطلاب المرحلة الثانوية، بإشراف مباشر من خبير واحد لضمان أعلى مستويات الفهم والتفوق.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl btn-hover-effect shadow-lg shadow-primary/20" asChild>
            <Link href="/signup">
              ابدأ رحلتك الآن
              <MoveLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-border hover:bg-accent text-accent-foreground font-bold rounded-xl btn-hover-effect" asChild>
            <Link href="#features">
              اكتشف الميزات
            </Link>
          </Button>
        </div>
      </div>

      {/* The rest of the page content will be outside the AuroraBackground component for a standard background */}
      <main className="w-full bg-background z-20 relative">

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">لماذا تختار منصتنا؟</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              نحن نركز على الجودة والكفاءة لنقدم لك تجربة تعليمية فريدة من نوعها.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard icon={<BrainCircuit className="w-8 h-8 text-primary" />} title="منهج مُعد بخبرة">
                محتوى تعليمي مُصمم خصيصًا ليتوافق مع أحدث المناهج، مع التركيز على المفاهيم الأساسية وتطبيقاتها العملية.
              </FeatureCard>
              <FeatureCard icon={<Video className="w-8 h-8 text-primary" />} title="شروحات تفاعلية">
                دروس فيديو عالية الجودة تجعل المواد الصعبة سهلة الفهم، مع إمكانية إعادة المشاهدة في أي وقت.
              </FeatureCard>
              <FeatureCard icon={<Trophy className="w-8 h-8 text-primary" />} title="متابعة لتحقيق التفوق">
                نظام متكامل لتتبع تقدمك، مع اختبارات دورية وواجبات لضمان استعدادك الكامل للامتحانات.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Instructor Bio Section */}
        <section id="instructor" className="py-20 sm:py-32 px-4 bg-card/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">تعرف على معلمك</h2>
              <h3 className="text-2xl text-primary font-semibold mb-4">[اسم المعلم]</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                بخ خبرة تمتد لأكثر من [عدد] سنوات في تدريس [المادة]، أحرص على تبسيط المعلومة وتقديمها بأسلوب شيق ومبتكر. هدفي ليس فقط نجاحك في الامتحانات، بل بناء أساس علمي قوي لمستقبلك.
              </p>
              <Button size="lg" asChild className="btn-hover-effect">
                <Link href="/dashboard">تصفح الدورات المتاحة</Link>
              </Button>
            </div>
            <div className="flex justify-center">
              {/* Placeholder for the instructor's image */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-muted rounded-full flex items-center justify-center border-4 border-primary">
                <span className="text-muted-foreground">صورة المعلم</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 sm:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">ماذا يقول طلابنا</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TestimonialCard
                quote="الشرح كان ممتازًا ومباشرًا. قدرت أفهم أجزاء كانت صعبة عليّ جدًا بفضل أسلوب المعلم المبسط والواضح."
                name="أحمد خالد"
              />
              <TestimonialCard
                quote="المنصة سهلة الاستخدام ومكنتني من المذاكرة في أي وقت. متابعة الواجبات والتقدم ساعدتني أنظم وقتي بشكل أفضل."
                name="سارة محمود"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="join" className="py-20 sm:py-32 px-4 text-center bg-gradient-to-t from-card/50 to-transparent">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">هل أنت مستعد لبدء رحلة التفوق؟</h2>
            <p className="text-muted-foreground mb-8">
              انضم لمئات الطلاب الذين اختاروا الطريق الأسهل والأكثر فعالية للنجاح. حسابك المجاني في انتظارك.
            </p>
            <Button size="lg" className="h-16 px-10 text-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl btn-hover-effect shadow-lg shadow-primary/20" asChild>
              <Link href="/signup">
                أنشئ حسابك الآن
              </Link>
            </Button>
          </div>
        </section>

      </main>
    </AuroraBackground>
  );
}