// src/components/landing/FAQSection.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "كيف يمكنني التسجيل في المنصة؟",
      answer: "يمكنك التسجيل بسهولة عن طريق الضغط على زر 'ابدأ رحلتك الآن' أو 'إنشاء حساب'، ثم ملء بياناتك الشخصية والأكاديمية المطلوبة. العملية لا تستغرق أكثر من دقيقة."
    },
    {
      question: "هل يمكنني مشاهدة الدروس أكثر من مرة؟",
      answer: "نعم بالطبع. بمجرد تسجيلك في أي دورة، تصبح جميع محاضراتها متاحة لك لمشاهدتها في أي وقت ومن أي جهاز، وبدون حد أقصى لعدد المشاهدات."
    },
    {
      question: "كيف يمكنني الحصول على المساعدة إذا واجهت مشكلة؟",
      answer: "نحن هنا لمساعدتك. يمكنك التواصل مباشرة مع أ/عمر عبر رقم الواتساب الموجود في أسفل الصفحة لأي استفسارات فنية أو أكاديمية."
    },
    {
      question: "هل المحتوى محدث باستمرار؟",
      answer: "نعم، نحرص على تحديث المحتوى بشكل دوري ليتوافق مع أحدث المناهج الدراسية وأي تغييرات قد تطرأ عليها، لضمان حصولك على أفضل وأحدث المواد التعليمية."
    }
  ];

  return (
    <section id="faq" className="py-20 sm:py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">أسئلة شائعة</h2>
          <p className="text-muted-foreground mt-4">كل ما تحتاج معرفته للبدء معنا.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-lg text-right hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}