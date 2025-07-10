// src/components/landing/FinalCTASection.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCTASection() {
  return (
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
  );
}