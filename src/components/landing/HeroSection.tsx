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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero-enhanced">
      {/* Enhanced Background Visual */}
      <HeroVisual />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Premium Badge */}
          <div className="animate-fade-in-up">
            <Badge
              variant="secondary"
              className="glass-premium border-0 shadow-glow-primary mb-8 px-8 py-4 text-lg font-bold tracking-wide hover-lift animate-glow relative overflow-hidden group"
            >
              <Sparkles className="w-6 h-6 mr-3 text-primary-600 animate-pulse" />
              <span className="text-primary-600 font-semibold">
                منصة التعليم الرائدة في مصر
              </span>
              {/* Subtle moving background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 via-white to-secondary-50/50 opacity-50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Badge>
          </div>

          {/* Hero Title */}
          <div className="animate-fade-in-up space-y-6 mb-10">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-arabic-tight">
              <span className="text-neutral-800">
                منصتك الأولى
              </span>
              <br />
              <span className="text-primary-600 font-extrabold relative">
                للتدريب و التعليم الاكاديمي
              </span>
            </h1>
            
            {/* Stats badges - same as before */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-white/50">
                <div className="flex">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-neutral-700">4.9/5 تقييم الملتحقين</span>
              </div>
              <div className="flex items-center gap-3 bg-gradient-to-r from-primary-500/10 to-primary-600/10 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-primary-200/50">
                <Users className="w-5 h-5 text-primary-600" />
                <span className="text-sm font-bold text-primary-700">+500 ملتحق</span>
              </div>
            </div>
          </div>



          {/* Enhanced Description */}
          <div className="animate-slide-in-right max-w-4xl">
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-700 leading-arabic-relaxed font-medium mb-6 text-shadow-sm">
              نقدم شرحًا متخصصًا ومتابعة دقيقة لملتحقين المرحلة للمتدربين الملتحقين
            </p>
            <p className="text-lg md:text-xl text-neutral-600 leading-arabic-normal font-normal bg-white/40 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/50">
              بإشراف مباشر من عدد كبير من الخبراء لضمان أعلى مستويات الفهم والتفوق
            </p>
          </div>

          {/* Premium CTA Buttons */}
          <div className="animate-fade-in-up mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link href={session?.user ? getRoleBasedRedirectUrl(session.user.role) : "/signup"}>
              <Button
                size="xl"
                className="h-16 px-10 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-black shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group border-0 w-full sm:w-auto"
              >
                <span className="flex items-center gap-3 relative z-10">
                  <span>{session?.user ? "انتقل إلى لوحة التحكم" : "ابدأ رحلتك الآن"}</span>
                  <MoveLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Button>
            </Link>

            <Link href="#platform-preview">
              <Button
                size="xl"
                variant="outline"
                className="h-16 px-10 text-lg font-bold rounded-2xl bg-white/90 backdrop-blur-sm border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-800 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group w-full sm:w-auto"
              >
                <span className="flex items-center gap-3 relative z-10">
                  <Play className="w-6 h-6 fill-primary-500" />
                  <span>شاهد عرض توضيحي</span>
                </span>
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-primary-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="animate-fade-in-up mt-16 pt-8 border-t border-primary-200/40">
            <p className="text-sm text-neutral-600 mb-8 font-medium">
              موثوق به من قبل...
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {/* Enhanced School indicators */}
              <div className="flex items-center gap-3 text-neutral-500 hover-lift cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-primary-700">م1</span>
                </div>
                <span className="text-sm font-semibold">
                  منصات تعليمية
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500 hover-lift cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-secondary-700">
                    ن
                  </span>
                </div>
                <span className="text-sm font-semibold">
                  اكادمية الدكتور
                </span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500 hover-lift cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-300 to-secondary-300 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-primary-800">م</span>
                </div>
                <span className="text-sm font-semibold">الكثير من المتدربين الشخصيين</span>
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
