// src/components/landing/TestimonialsSection.tsx
import { Quote, Star } from "lucide-react";

const TestimonialCard = ({ quote, name }: { quote: string, name: string }) => (
  <div className="bg-card/70 backdrop-blur-sm p-6 rounded-lg border border-border card-hover-effect h-full">
    <Quote className="w-8 h-8 text-primary mb-4" />
    <p className="text-foreground/90 mb-4 italic">"{quote}"</p>
    <div className="flex items-center justify-between mt-auto">
      <p className="font-semibold text-primary">{name}</p>
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
      </div>
    </div>
  </div>
);

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">ماذا يقول طلابنا</h2>
        {/* This grid now stacks on mobile and goes to 2 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TestimonialCard
            quote="الشرح كان ممتازًا ومباشرًا. قدرت أفهم أجزاء كانت صعبة عليّ جدًا بفضل أسلوب المعلم المبسط والواضح."
            name="أحمد خالد"
          />
          <TestimonialCard
            quote="المنصة سهلة الاستخدام ومكنتني من المذاكرة في أي وقت. متابعة الواجبات والتقدم ساعدتني أنظم وقتي بشكل أفضل."
            name="سارة محمود"
          />
        </div>
      </div>
    </section>
  );
}