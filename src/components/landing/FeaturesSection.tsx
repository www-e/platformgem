// src/components/landing/FeaturesSection.tsx
import { BrainCircuit, Trophy, Video } from "lucide-react";

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

export default function FeaturesSection() {
  return (
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
  );
}