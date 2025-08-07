// src/components/shared/footer.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { InstantLink } from "../ui/instant-navigation";
import { FadeInScroll, StaggerChildren, StaggerItem } from "../ui/micro-interactions";
import { 
  Copyright, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Send,
  Heart,
  ExternalLink,
  ArrowUp
} from "lucide-react";
import { useOptimizedMotion } from "@/hooks/useAnimations";
import { cn } from "@/lib/utils";

// Social Media Icons
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.001-1.04 3.837 3.837-1.039z"/>
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { shouldReduceMotion } = useOptimizedMotion();

  // Social media links with follower counts (mock data)
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com/yourpage",
      followers: "12.5K",
      color: "hover:text-blue-600"
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com/yourhandle",
      followers: "8.2K",
      color: "hover:text-sky-500"
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com/yourhandle",
      followers: "15.3K",
      color: "hover:text-pink-600"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com/in/yourprofile",
      followers: "5.1K",
      color: "hover:text-blue-700"
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com/yourchannel",
      followers: "25.8K",
      color: "hover:text-red-600"
    },
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      url: "https://wa.me/201154688628",
      followers: "مباشر",
      color: "hover:text-green-600"
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      url: "https://t.me/yourchannel",
      followers: "3.7K",
      color: "hover:text-blue-500"
    }
  ];

  // Footer navigation links
  const footerLinks = {
    platform: [
      { name: "الدورات", href: "/courses" },
      { name: "المدربين", href: "/instructors" },
      { name: "الشهادات", href: "/certificates" },
      { name: "المدونة", href: "/blog" }
    ],
    support: [
      { name: "مركز المساعدة", href: "/help" },
      { name: "الأسئلة الشائعة", href: "/faq" },
      { name: "تواصل معنا", href: "/contact" },
      { name: "الدعم الفني", href: "/support" }
    ],
    legal: [
      { name: "سياسة الخصوصية", href: "/privacy" },
      { name: "شروط الاستخدام", href: "/terms" },
      { name: "سياسة الاسترداد", href: "/refund" },
      { name: "ملفات تعريف الارتباط", href: "/cookies" }
    ]
  };

  // Newsletter subscription
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubscribed(true);
    setIsLoading(false);
    setEmail("");
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-t border-neutral-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Description */}
          <StaggerItem className="lg:col-span-1">
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg font-display">م</span>
                </div>
                <span className="text-xl font-bold text-neutral-900 font-display">منصة التعلم</span>
              </motion.div>
              
              <p className="text-neutral-600 text-sm leading-arabic-relaxed font-primary">
                منصة تعليمية متطورة تهدف إلى تقديم أفضل تجربة تعلم رقمية باللغة العربية مع أحدث التقنيات والأساليب التفاعلية.
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Mail className="h-4 w-4 text-primary-600" />
                  <span className="font-primary">info@platform.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <Phone className="h-4 w-4 text-primary-600" />
                  <span className="font-primary">+20 115 468 8628</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 text-primary-600" />
                  <span className="font-primary">القاهرة، مصر</span>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Platform Links */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 font-display">المنصة</h3>
              <ul className="space-y-2">
                {footerLinks.platform.map((link) => (
                  <li key={link.name}>
                    <InstantLink
                      href={link.href}
                      className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-primary leading-arabic-normal"
                      preloadOnHover
                    >
                      {link.name}
                    </InstantLink>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Support Links */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 font-display">الدعم</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <InstantLink
                      href={link.href}
                      className="text-neutral-600 hover:text-primary-600 transition-colors text-sm font-primary leading-arabic-normal"
                      preloadOnHover
                    >
                      {link.name}
                    </InstantLink>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Newsletter & Social */}
          <StaggerItem>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900 font-display">ابق على تواصل</h3>
              
              {/* Newsletter Signup */}
              <div className="space-y-3">
                <p className="text-sm text-neutral-600 font-primary leading-arabic-normal">
                  اشترك في نشرتنا الإخبارية للحصول على آخر التحديثات والعروض
                </p>
                
                {!isSubscribed ? (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <Input
                      type="email"
                      placeholder="بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                      required
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="w-full"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      <Send className="ml-2 h-4 w-4" />
                      اشتراك
                    </Button>
                  </form>
                ) : (
                  <motion.div
                    className="flex items-center gap-2 text-success text-sm font-primary"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    شكراً لك! تم الاشتراك بنجاح
                  </motion.div>
                )}
              </div>
            </div>
          </StaggerItem>
        </StaggerChildren>

        {/* Social Media Links */}
        <FadeInScroll className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-right">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3 font-display">تابعنا على</h4>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group relative p-2 bg-white rounded-lg border border-neutral-200 text-neutral-600 transition-all duration-200 hover:shadow-elevation-2",
                      social.color
                    )}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.1, y: -2 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                  >
                    <social.icon className="h-5 w-5" />
                    
                    {/* Follower count tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-primary">
                      {social.followers}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Scroll to Top Button */}
            <motion.button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowUp className="h-4 w-4" />
              العودة للأعلى
            </motion.button>
          </div>
        </FadeInScroll>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 font-primary">
              <Copyright className="h-4 w-4" />
              <span>
                {new Date().getFullYear()} جميع الحقوق محفوظة لـ 
                <span className="font-semibold text-neutral-900 mx-1">منصة التعلم</span>
              </span>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4">
              {footerLinks.legal.map((link, index) => (
                <span key={link.name} className="flex items-center gap-4">
                  <InstantLink
                    href={link.href}
                    className="text-sm text-neutral-600 hover:text-primary-600 transition-colors font-primary"
                    preloadOnHover
                  >
                    {link.name}
                  </InstantLink>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-neutral-400">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}