// src/components/landing/HeroSection.tsx
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <AuroraBackground>
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
    </AuroraBackground>
  );
}