// src/app/page.tsx
import FeaturesSection from "@/components/landing/FeaturesSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import InstructorSection from "@/components/landing/InstructorSection";
import PlatformPreviewSection from "@/components/landing/PlatformPreviewSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      
      {/* The rest of the page content flows naturally after the hero */}
      <main className="w-full bg-background z-20 relative">
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