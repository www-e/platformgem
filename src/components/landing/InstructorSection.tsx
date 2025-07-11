// src/components/landing/InstructorSection.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function InstructorSection() {
  return (
    <section id="instructor" className="py-20 sm:py-32 px-4 bg-card/50">
      {/* THIS IS THE CORRECTED LAYOUT */}
      <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row gap-12 items-center">
        
        {/* Text content will appear second on mobile (because of flex-col-reverse) */}
        <div className="w-full md:w-1/2 text-center md:text-right">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">تعرف على معلمك</h2>
          <h3 className="text-2xl text-primary font-semibold mb-4">المهندس في الفيزياء</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            متخصص في تدريس الفيزياء لجميع مراحل الثانوية العامة بخبرة واسعة. أقدم شرحًا تفصيليًا ومبسطًا يركز على بناء فهم عميق للمفاهيم الفيزيائية، مع حلول عملية للمسائل الصعبة وتدريب مكثف على أسئلة الامتحانات، لضمان استعدادك الكامل وتحقيق التميز.
          </p>
          <Button size="lg" asChild className="btn-hover-effect">
            <Link href="/dashboard">تصفح الدورات المتاحة</Link>
          </Button>
        </div>

        {/* Image content will appear first on mobile */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Image 
            src="/omar.png" // IMPORTANT: Make sure this path is correct
            alt="صورة المهندس في الفيزياء" 
            width={400} 
            height={400} 
            className="object-contain"
            priority={true} // Adding priority as it's a key landing page image
          />
        </div>
      </div>
    </section>
  );
}