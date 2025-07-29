// src/app/page.tsx
import { Metadata } from 'next';
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import InstructorSection from "@/components/landing/InstructorSection";
import PlatformPreviewSection from "@/components/landing/PlatformPreviewSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";
import FeaturedCoursesSection from "@/components/landing/FeaturedCoursesSection";

export const metadata: Metadata = {
  title: 'منصة التعلم الإلكتروني - دورات تعليمية متميزة',
  description: 'اكتشف أفضل الدورات التعليمية الإلكترونية في مختلف المجالات. تعلم مع أفضل المدرسين واحصل على شهادات معتمدة.',
  keywords: 'دورات تعليمية, تعلم إلكتروني, شهادات معتمدة, تعليم أونلاين, دورات عربية',
  authors: [{ name: 'منصة التعلم الإلكتروني' }],
  creator: 'منصة التعلم الإلكتروني',
  publisher: 'منصة التعلم الإلكتروني',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourplatform.com'), // Replace with your actual domain
  alternates: {
    canonical: '/',
    languages: {
      'ar-SA': '/ar',
      'en-US': '/en',
    },
  },
  openGraph: {
    title: 'منصة التعلم الإلكتروني - دورات تعليمية متميزة',
    description: 'اكتشف أفضل الدورات التعليمية الإلكترونية في مختلف المجالات. تعلم مع أفضل المدرسين واحصل على شهادات معتمدة.',
    url: '/',
    siteName: 'منصة التعلم الإلكتروني',
    images: [
      {
        url: '/og-image.jpg', // Add your OG image
        width: 1200,
        height: 630,
        alt: 'منصة التعلم الإلكتروني',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة التعلم الإلكتروني - دورات تعليمية متميزة',
    description: 'اكتشف أفضل الدورات التعليمية الإلكترونية في مختلف المجالات.',
    images: ['/og-image.jpg'], // Add your Twitter image
    creator: '@yourplatform', // Replace with your Twitter handle
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google verification code
    yandex: 'your-yandex-verification-code', // Add your Yandex verification code if needed
  },
};

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      
      {/* The rest of the page content flows naturally after the hero */}
      <main className="w-full bg-background z-20 relative">
        <FeaturedCoursesSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PlatformPreviewSection />
        <InstructorSection />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection />
      </main>
    </>
  );
}