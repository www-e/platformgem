// src/components/landing/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoveLeft, Play, Users, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getRoleBasedRedirectUrl } from "@/lib/auth-redirects";
import { HeroVisual } from "./HeroVisual";

export default async function HeroSection() {
  const session = await auth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Enhanced Background Visual */}
      <HeroVisual />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          
          {/* Premium Badge */}
          <div className="animate-fade-in-up">
            <Badge 
              variant="secondary" 
              className="glass-medium border-0 shadow-glow mb-8 px-6 py-3 text-lg font-semibold tracking-wide"
            >
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              منصة التعليم الرائدة في مصر
            </Badge>
          </div>

          {/* Hero Title */}
          <div className="animate-fade-in-up space-y-4 mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-arabic-tight">
              <span className="bg-gradient-to-br from-neutral-900 via-neutral-700 to-neutral-600 bg-clip-text text-transparent">
                منصتك الأولى
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                للتميز الدراسي
              </span>
            </h1>
            
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 glass-light rounded-full px-4 py-2">
                <Star className="w-5 h-5 text-secondary fill-secondary" />
                <span className="text-sm font-semibold">4.9/5 تقييم الطلاب</span>
              </div>
              <div className="flex items-center gap-2 glass-light rounded-full px-4 py-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">+500 طالب</span>
              </div>
            </div>
          </div>

          {/* Enhanced Description */}
          <div className="animate-slide-in-right max-w-4xl">
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-600 leading-arabic-relaxed font-light mb-4">
              نقدم شرحًا متخصصًا ومتابعة دقيقة لطلاب المرحلة الثانوية
            </p>
            <p className="text-lg md:text-xl text-neutral-500 leading-arabic-normal">
              بإشراف مباشر من خبير واحد لضمان أعلى مستويات الفهم والتفوق
            </p>
          </div>

          {/* Premium CTA Buttons */}
          <div className="animate-fade-in-up mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button
              size="xl"
              className="h-16 px-8 text-lg font-bold rounded-2xl gradient-primary text-white shadow-elevation-3 hover:shadow-elevation-4 btn-hover-effect relative overflow-hidden group"
              asChild
            >
              <Link href={session?.user ? getRoleBasedRedirectUrl(session.user.role) : "/signup"}>
                <div className="flex items-center gap-3">
                  <span>{session?.user ? "انتقل إلى لوحة التحكم" : "ابدأ رحلتك الآن"}</span>
                  <MoveLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                </div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </Button>

            <Button
              size="xl"
              variant="outline"
              className="h-16 px-8 text-lg font-bold rounded-2xl glass-medium border-2 border-neutral-200/30 text-neutral-700 hover:border-primary/30 hover:text-primary hover:shadow-elevation-2 btn-hover-effect"
              asChild
            >
              <Link href="#platform-preview">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6" />
                  <span>شاهد عرض توضيحي</span>
                </div>
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-in-up mt-16 pt-8 border-t border-neutral-200/30">
            <p className="text-sm text-neutral-500 mb-6">موثوق به من قبل طلاب مدارس مميزة</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
              {/* School logos placeholder - you can replace with actual logos */}
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <span className="text-sm font-medium">المدرسة الثانوية الأولى</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <span className="text-sm font-medium">مدرسة النور الثانوية</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-400">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <span className="text-sm font-medium">مدرسة المستقبل</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-neutral-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-neutral-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
