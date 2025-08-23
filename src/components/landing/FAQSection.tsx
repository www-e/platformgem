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
    question: "How can I register on the platform?",
    answer: "You can easily register by clicking the 'Start Your Journey Now' or 'Create Account' button, then filling in your required personal and academic information. The process takes less than one minute. You'll receive an instant email confirmation with your account details.",
    category: "general",
    popular: true
  },
  {
    question: "Can I watch lessons more than once?",
    answer: "Absolutely! Once you enroll in any course, all its lectures become available to you at any time and from any device, with no limit on the number of views. You can also download educational materials and references for offline study.",
    category: "courses",
    popular: true
  },
  {
    question: "What payment methods are available?",
    answer: "We accept all major payment methods including: credit cards (Visa, Mastercard), direct bank transfer, Fawry, and Instapay. All transactions are secure and encrypted. We also offer flexible payment plans and discounts for students.",
    category: "billing"
  },
  {
    question: "How can I get help if I encounter a problem?",
    answer: "We're here for you 24/7! You can contact us via: live chat on the site, the WhatsApp number at the bottom of the page, email, or contact form. Our technical support team is specialized and responds within minutes.",
    category: "technical",
    popular: true
  },
  {
    question: "Is the content updated regularly?",
    answer: "Yes, we regularly and continuously update the content to align with the latest curricula and any changes that may occur. We add new lectures monthly and develop content based on student feedback and market needs, ensuring you get the best and latest educational materials.",
    category: "courses"
  },
  {
    question: "Can I get a completion certificate?",
    answer: "Yes! Upon successfully completing any course and achieving a success rate of 80% or higher on the exams, you&apos;ll receive an accredited completion certificate that can be printed. The certificate includes your name, course duration, and grade achieved, and can be used in your resume or university applications.",
    category: "courses"
  },
  {
    question: "What is the refund policy?",
    answer: "We provide a 100% money-back guarantee within the first 14 days of starting any course, without asking any questions. If you're not satisfied with the service for any reason, you can request a full refund via the contact form or customer service.",
    category: "billing"
  },
  {
    question: "Can I access the content from my mobile phone?",
    answer: "Absolutely! Our platform is fully compatible with all devices - mobile phones, tablets, and desktop computers. We also have an easy-to-use mobile app available in the app store, providing a seamless learning experience with offline viewing capabilities.",
    category: "technical"
  }
];

const categoryConfig = {
  general: { label: "General", color: "bg-primary/10 text-primary-700", icon: HelpCircle },
  technical: { label: "Technical", color: "bg-blue-100 text-blue-700", icon: MessageCircle },
  billing: { label: "Billing", color: "bg-secondary/10 text-secondary-700", icon: CheckCircle },
  courses: { label: "Courses", color: "bg-emerald-100 text-emerald-700", icon: Sparkles }
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
            Frequently Asked Questions
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            <span className="text-neutral-800">Answers to All Your</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Do you have a question? Browse the most frequently asked questions or contact us directly for an instant answer
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
            All Questions ({faqs.length})
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
                              Most Requested
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
              <h3 className="text-3xl font-bold text-neutral-800 font-display mb-4 leading-tight">
                Didn&apos;t Find an Answer to Your Question?
              </h3>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-relaxed">
                Our support team is available 24/7 to help you. Contact us and you&apos;ll get a reply within minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* WhatsApp */}
              <div className="text-center p-6 bg-green-50/50 rounded-2xl border border-green-200/30">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-green-800 mb-2">WhatsApp</h4>
                <p className="text-sm text-green-600 mb-3">Instant reply within minutes</p>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black">
                  Contact Now
                </Button>
              </div>

              {/* Email */}
              <div className="text-center p-6 bg-blue-50/50 rounded-2xl border border-blue-200/30">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-blue-800 mb-2">Email</h4>
                <p className="text-sm text-blue-600 mb-3">Detailed inquiries</p>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  أرسل إيميل
                </Button>
              </div>

              {/* Live Chat */}
              <div className="text-center p-6 bg-primary-50/50 rounded-2xl border border-primary-200/30">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <h4 className="font-bold text-primary-800 mb-2">Live Chat</h4>
                <p className="text-sm text-primary-600 mb-3">Available 24/7</p>
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-black">
                  ابدأ المحادثة
                </Button>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-200/30">
              <p className="text-sm text-neutral-500 mb-4">
                Or browse our comprehensive help library
              </p>
              <Link href="/help">
                <Button variant="outline" size="lg" className="border-2 border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5 btn-hover-effect">
                  Help Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
