// src/components/landing/InstructorSection.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InstructorSection() {
  return (
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
          <div className="w-64 h-64 md:w-80 md:h-80 bg-muted rounded-full flex items-center justify-center border-4 border-primary">
            <span className="text-muted-foreground">صورة المعلم</span>
          </div>
        </div>
      </div>
    </section>
  );
}