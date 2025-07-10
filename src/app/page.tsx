// src/app/page.tsx

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GraduationCap, Zap, BookOpen } from "lucide-react";
import { FloatingParticles } from "@/components/ui/floating-particles";

export default function LandingPage() {
  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      <FloatingParticles count={30} />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center p-4">
        <div className="mb-6">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center animate-float">
            <GraduationCap className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          منصة التعلم المستقبلية
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-300 mb-8">
          انضم إلى مجتمعنا التعليمي المتطور وابدأ رحلتك نحو التميز. دورات متخصصة، متابعة دقيقة، ومستقبل مشرق.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105" asChild>
            <Link href="/signup">
              <Zap className="mr-2" />
              ابدأ الآن مجاناً
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-white/10 border-white/20 hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105" asChild>
            <Link href="#features">
              <BookOpen className="mr-2" />
              اكتشف المزيد
            </Link>
          </Button>
        </div>
      </div>
      
      <section id="features" className="relative z-10 py-20 px-4 max-w-5xl mx-auto">
         <h2 className="text-center text-4xl font-bold text-white mb-12">الخصائص والمميزات</h2>
         {/* Feature sections can be added here in the future */}
      </section>
    </div>
  );
}