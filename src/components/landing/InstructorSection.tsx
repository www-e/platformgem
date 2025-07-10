// src/components/landing/InstructorSection.tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image"; // We'll use Next/Image for better optimization

export default function InstructorSection() {
  return (
    <section id="instructor" className="py-20 sm:py-32 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* On mobile, this will appear second due to flex-col-reverse */}
        <div className="text-center md:text-right">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">تعرف على معلمك</h2>
          <h3 className="text-2xl text-primary font-semibold mb-4">المهندس في الفيزياء</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            متخصص في تدريس الفيزياء لجميع مراحل الثانوية العامة بخبرة واسعة. أقدم شرحًا تفصيليًا ومبسطًا يركز على بناء فهم عميق للمفاهيم الفيزيائية، مع حلول عملية للمسائل الصعبة وتدريب مكثف على أسئلة الامتحانات، لضمان استعدادك الكامل وتحقيق التميز.
          </p>
          <Button size="lg" asChild className="btn-hover-effect">
            <Link href="/dashboard">تصفح الدورات المتاحة</Link>
          </Button>
        </div>
        {/* On mobile, this div will appear first */}
        <div className="flex justify-center md:order-first">
          {/* 
            Recommended image size: at least 500x500 pixels.
          */}
          <Image 
            src="/omar.png" // IMPORTANT: Change this to your image path
            alt="صورة المهندس في الفيزياء" 
            width={400} 
            height={400} 
            className="object-contain" // Ensures the image fits well
          />
        </div>
      </div>
    </section>
  );
}