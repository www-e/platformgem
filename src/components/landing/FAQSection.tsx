// src/components/landing/FAQSection.tsx
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageCircle, 
  Sparkles, 
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
  category: "general" | "technical" | "billing" | "courses";
  popular?: boolean;
}

const faqs: FAQ[] = [
  {
    question: "كيف يمكنني التسجيل في المنصة؟",
    answer: "يمكنك التسجيل بسهولة عن طريق الضغط على زر 'ابدأ رحلتك الآن' أو 'إنشاء حساب'، ثم ملء بياناتك الشخصية والأكاديمية المطلوبة. العملية لا تستغرق أكثر من دقيقة واحدة. ستحصل على تأكيد فوري عبر البريد الإلكتروني مع تفاصيل حسابك.",
    category: "general",
    popular: true
  },
  {
    question: "هل يمكنني مشاهدة الدروس أكثر من مرة؟",
    answer: "نعم بالطبع! بمجرد تسجيلك في أي دورة، تصبح جميع محاضراتها متاحة لك لمشاهدتها في أي وقت ومن أي جهاز، وبدون حد أقصى لعدد المشاهدات. يمكنك أيضاً تحميل المواد التعليمية المساعدة والمراجع للدراسة دون اتصال بالإنترنت.",
    category: "courses",
    popular: true
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    answer: "نقبل جميع وسائل الدفع الرئيسية بما في ذلك: الدفع بالبطاقات الائتمانية (فيزا، ماستركارد)، التحويل البنكي المباشر، فوري، وإنستاباي. جميع المعاملات آمنة ومشفرة. كما نوفر خطط دفع مرنة وخصومات للملتحقين.",
    category: "billing"
  },
  {
    question: "كيف يمكنني الحصول على المساعدة إذا واجهت مشكلة؟",
    answer: "نحن هنا لمساعدتك على مدار الساعة! يمكنك التواصل معنا عبر: الدردشة المباشرة في الموقع، رقم الواتساب الموجود في أسفل الصفحة، البريد الإلكتروني، أو نموذج الاتصال. فريق الدعم التقني متخصص ويستجيب خلال دقائق معدودة.",
    category: "technical",
    popular: true
  },
  {
    question: "هل المحتوى محدث باستمرار؟",
    answer: "نعم، نحرص على تحديث المحتوى بشكل دوري ومستمر ليتوافق مع أحدث المناهج الدراسية وأي تغييرات قد تطرأ عليها. نضيف محاضرات جديدة شهرياً ونطور المحتوى بناءً على ملاحظات الملتحقين واحتياجات السوق، لضمان حصولك على أفضل وأحدث المواد التعليمية.",
    category: "courses"
  },
  {
    question: "هل يمكنني الحصول على شهادة إتمام؟",
    answer: "نعم! عند إكمال أي دورة بنجاح وتحقيق معدل نجاح 80% أو أكثر في الاختبارات، ستحصل على شهادة إتمام معتمدة وقابلة للطباعة. الشهادة تتضمن اسمك ومدة الدورة والدرجة المحققة، ويمكن استخدامها في السيرة الذاتية أو التقديم للجامعات.",
    category: "courses"
  },
  {
    question: "ما هي سياسة الاسترداد؟",
    answer: "نوفر ضمان استرداد المال بنسبة 100% خلال أول 14 يوماً من بدء أي دورة، دون طرح أي أسئلة. إذا لم تكن راضياً عن الخدمة لأي سبب، يمكنك طلب الاسترداد الكامل عبر نموذج الاتصال أو خدمة العملاء.",
    category: "billing"
  },
  {
    question: "هل يمكنني الوصول للمحتوى من الهاتف المحمول؟",
    answer: "بالطبع! منصتنا متوافقة بالكامل مع جميع الأجهزة - الهاتف المحمول، التابلت، والكمبيوتر المكتبي. لدينا أيضاً تطبيق جوال سهل الاستخدام متاح على متجر التطبيقات، يوفر تجربة تعلم سلسة مع إمكانية التحميل للمشاهدة دون اتصال بالإنترنت.",
    category: "technical"
  }
];

const categoryConfig = {
  general: { label: "عام", color: "bg-primary/10 text-primary-700", icon: HelpCircle },
  technical: { label: "تقني", color: "bg-blue-100 text-blue-700", icon: MessageCircle },
  billing: { label: "الدفع", color: "bg-secondary/10 text-secondary-700", icon: CheckCircle },
  courses: { label: "الدورات", color: "bg-emerald-100 text-emerald-700", icon: Sparkles }
};

export default function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = selectedCategory === "all" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const categories = ["all", ...Object.keys(categoryConfig)] as const;

  const handleValueChange = (value: string[]) => {
    setOpenItems(value);
  };

  return (
    <section id="faq" className="section-padding bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 relative overflow-hidden">
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-16 w-32 h-32 bg-gradient-to-br from-primary-200/40 to-primary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-secondary-200/40 to-secondary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-blue-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        
        {/* Enhanced section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            الأسئلة الشائعة
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-arabic-tight">
            <span className="text-neutral-800">إجابات لجميع</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              استفساراتك
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-arabic-relaxed">
            هل لديك سؤال؟ تصفح الأسئلة الأكثر شيوعاً أو تواصل معنا مباشرة للحصول على إجابة فورية
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300 btn-hover-effect",
              selectedCategory === "all"
                ? "bg-primary-500 text-black shadow-elevation-3"
                : "bg-white/60 text-neutral-700 border border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5"
            )}
          >
            جميع الأسئلة ({faqs.length})
          </button>
          
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = faqs.filter(faq => faq.category === key).length;
            const Icon = config.icon;
            
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 btn-hover-effect",
                  selectedCategory === key
                    ? "bg-primary-500 text-black shadow-elevation-3"
                    : "bg-white/60 text-neutral-700 border border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{config.label} ({count})</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto mb-16">
          <Accordion 
            type="multiple" 
            value={openItems} 
            onValueChange={handleValueChange}
            className="space-y-4"
          >
            {filteredFAQs.map((faq, index) => {
              const categoryInfo = categoryConfig[faq.category];
              const isOpen = openItems.includes(`item-${index}`);
              
              return (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-2xl card-hover-effect shadow-elevation-2 hover:shadow-elevation-3 overflow-hidden"
                >
                  <AccordionTrigger className={cn(
                    "px-8 py-6 text-right hover:no-underline group transition-all duration-300",
                    "text-lg font-bold text-neutral-800 font-display leading-arabic-tight",
                    isOpen && "bg-primary/5"
                  )}>
                    <div className="flex items-start justify-between w-full">
                      <div className="text-right flex-1">
                        {faq.question}
                        <div className="flex items-center gap-3 mt-3">
                          <Badge className={cn("text-xs font-medium border-0", categoryInfo.color)}>
                            <categoryInfo.icon className="w-3 h-3 mr-1" />
                            {categoryInfo.label}
                          </Badge>
                          {faq.popular && (
                            <Badge className="bg-secondary/10 text-secondary-700 text-xs font-medium border-0">
                              <Sparkles className="w-3 h-3 mr-1" />
                              الأكثر طلباً
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-8 pb-8 pt-4">
                    <div className={cn(
                      "text-neutral-700 leading-arabic-relaxed text-lg",
                      "bg-neutral-50/50 rounded-xl p-6 border border-neutral-200/30"
                    )}>
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Enhanced Contact CTA */}
        <div className="text-center">
          <div className="glass-medium rounded-3xl p-12 shadow-elevation-4 border border-white/30 max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-neutral-800 font-display mb-4 leading-arabic-tight">
                لم تجد إجابة لسؤالك؟
              </h3>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-arabic-relaxed">
                فريق الدعم لدينا متاح على مدار الساعة لمساعدتك. تواصل معنا وستحصل على رد خلال دقائق
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* WhatsApp */}
              <div className="text-center p-6 bg-green-50/50 rounded-2xl border border-green-200/30">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-green-800 mb-2">واتساب</h4>
                <p className="text-sm text-green-600 mb-3">رد فوري خلال دقائق</p>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                  تواصل الآن
                </Button>
              </div>

              {/* Email */}
              <div className="text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-200/30">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-blue-800 mb-2">البريد الإلكتروني</h4>
                <p className="text-sm text-blue-600 mb-3">استفسارات مفصلة</p>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  أرسل إيميل
                </Button>
              </div>

              {/* Live Chat */}
              <div className="text-center p-6 bg-primary-50/50 rounded-2xl border border-primary-200/30">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-primary-800 mb-2">دردشة مباشرة</h4>
                <p className="text-sm text-primary-600 mb-3">متاح 24/7</p>
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-black">
                  ابدأ المحادثة
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-200/30">
              <p className="text-sm text-neutral-500 mb-4">
                أو تصفح مكتبة المساعدة الشاملة
              </p>
              <Link href="/help">
                <Button variant="outline" size="lg" className="border-2 border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5 btn-hover-effect">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  مركز المساعدة
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
