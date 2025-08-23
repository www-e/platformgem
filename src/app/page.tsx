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
  title: 'Sport School | Transform Your Learning Journey',
  description: 'Experience specialized academic training with Egypt\'s leading educational platform. Expert instruction, personalized follow-up, and proven results for student success.',
  keywords: 'educational platform, academic training, student success, expert instruction, personalized learning, Egypt education',
  authors: [{ name: 'Sport School' }],
  creator: 'Sport School',
  publisher: 'Sport School',
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
    title: 'Sport School | Transform Your Learning Journey',
    description: 'Experience specialized academic training with Egypt\'s leading educational platform. Expert instruction, personalized follow-up, and proven results for student success.',
    url: '/',
    siteName: 'Sport School',
    images: [
      {
        url: '/og-image.jpg', // Add your OG image
        width: 1200,
        height: 630,
        alt: 'Sport School - Modern Educational Experience',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sport School | Transform Your Learning Journey',
    description: 'Experience specialized academic training with Egypt\'s leading educational platform.',
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