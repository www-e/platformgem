// src/components/landing/HeroSection.tsx
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getRoleBasedRedirectUrl } from "@/lib/auth-redirects";
import { HeroVisual } from "./HeroVisual"; // Import the new component

export default async function HeroSection() {
  const session = await auth();

  return (
    <section className="relative w-full h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Visual Element */}
      <HeroVisual />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-display text-neutral-800">
          منصتك الأولى للتميز الدراسي
        </h1>
        <p className="mt-6 max-w-3xl text-lg md:text-xl text-neutral-600 leading-relaxed">
          نقدم شرحًا متخصصًا ومتابعة دقيقة لطلاب المرحلة الثانوية، بإشراف مباشر من خبير واحد لضمان أعلى مستويات الفهم والتفوق.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button
            size="xl"
            className="font-bold rounded-xl btn-hover-effect shadow-lg shadow-primary/20"
            asChild
          >
            <Link href={session?.user ? getRoleBasedRedirectUrl(session.user.role) : "/signup"}>
              <span>{session?.user ? "انتقل إلى لوحة التحكم" : "ابدأ رحلتك الآن"}</span>
              <MoveLeft className="mr-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="font-bold rounded-xl btn-hover-effect border-2"
            asChild
          >
            <Link href="#features">
              اكتشف الميزات
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}