// src/components/landing/HeroSection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoveLeft, Play, Users, Star, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getRoleBasedRedirectUrl } from "@/lib/auth-redirects";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const { data: session } = useSession();
  const [isClient, setIsClient] = useState(false);
  
  // For parallax effect
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, -50]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const y3 = useTransform(scrollY, [0, 500], [0, -150]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
            <div className="h-12 w-48 bg-neutral-200 rounded-full mb-8 animate-pulse" />
            <div className="space-y-6 mb-10">
              <div className="h-20 bg-neutral-200 rounded-full" />
              <div className="h-20 bg-neutral-200 rounded-full" />
              <div className="flex justify-center gap-8 mt-8">
                <div className="h-10 w-40 bg-neutral-200 rounded-full" />
                <div className="h-10 w-40 bg-neutral-200 rounded-full" />
              </div>
            </div>
            <div className="max-w-4xl">
              <div className="h-8 bg-neutral-200 rounded-full mb-6" />
              <div className="h-6 bg-neutral-200 rounded-full" />
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <div className="h-16 w-64 bg-neutral-200 rounded-2xl" />
              <div className="h-16 w-64 bg-neutral-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Enhanced Background with Parallax Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50" />
        
        {/* Parallax floating elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-primary-300/10 rounded-full blur-3xl"
        />
        
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-1/3 right-20 w-48 h-48 bg-gradient-to-br from-secondary-200/20 to-secondary-300/10 rounded-full blur-3xl"
        />
        
        <motion.div 
          style={{ y: y3 }}
          className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-primary-100/30 to-secondary-100/20 rounded-full blur-2xl"
        />
        
        {/* Geometric elements */}
        <div className="absolute top-20 right-20 w-24 h-24 border border-primary-200/20 rotate-45 rounded-sm" />
        <div className="absolute bottom-32 left-32 w-16 h-16 bg-gradient-to-br from-secondary-300/20 to-secondary-400/10 rounded-full" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          
          {/* Text Content */}
          <div className="flex flex-col justify-center">
            {/* Premium Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Badge
                variant="secondary"
                className="glass-premium border-0 shadow-lg mb-4 px-6 py-3 text-base font-bold tracking-wide hover-lift relative overflow-hidden group"
              >
                <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                <span className="text-primary-600 font-semibold">
                  Egypt's Leading Educational Platform
                </span>
                {/* Subtle moving background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 via-white to-secondary-50/50 opacity-50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Badge>
            </motion.div>

            {/* Hero Title */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6 mb-8"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
                <span className="text-neutral-800 block">
                  Transform Your Learning
                </span>
                <span className="text-primary-600 font-display relative block">
                  Journey With Us
                  <span className="absolute -bottom-2 left-0 w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></span>
                </span>
              </h1>
              
              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-6 mt-8">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-white/50">
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-neutral-700">4.9/5</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-primary-500/10 to-primary-600/10 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-primary-200/50">
                  <Users className="w-4 h-4 text-primary-600" />
                  <span className="text-sm font-bold text-primary-700">+500 Enrolled</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10"
            >
              <p className="text-lg md:text-xl text-neutral-700 leading-relaxed font-medium mb-4">
                Experience specialized instruction and precise follow-up tailored for your academic success.
              </p>
              <p className="text-base md:text-lg text-neutral-600 leading-normal font-normal">
                Direct supervision from expert educators ensures the highest levels of understanding and excellence.
              </p>
            </motion.div>

            {/* Premium CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href={session?.user ? getRoleBasedRedirectUrl(session.user.role) : "/signup"}>
                <Button
                  size="xl"
                  className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-black shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group border-0 w-full sm:w-auto font-accent"
                >
                  <span className="flex items-center gap-3 relative z-10">
                    <span>{session?.user ? "Go to Dashboard" : "Start Learning Today"}</span>
                    <MoveLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>

              <Link href="#platform-preview">
                <Button
                  size="xl"
                  variant="outline"
                  className="h-14 px-8 text-lg font-bold rounded-xl bg-white/90 backdrop-blur-sm border-2 border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group w-full sm:w-auto font-accent"
                >
                  <span className="flex items-center gap-3 relative z-10">
                    <Play className="w-5 h-5 fill-primary-500" />
                    <span>Watch Demo</span>
                  </span>
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-50/50 to-primary-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
            </motion.div>
          </div>
          
          {/* Visual Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* Main visual card */}
              <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30 transform rotate-3">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group">
                      <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-xl">🎓</span>
                  </div>
                  <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-primary-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">95%</div>
                    <div className="text-xs text-neutral-600">Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-secondary-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-secondary-600">24/7</div>
                    <div className="text-xs text-neutral-600">Support</div>
                  </div>
                  <div className="text-center p-3 bg-primary-50/50 rounded-xl">
                    <div className="text-2xl font-bold text-primary-600">500+</div>
                    <div className="text-xs text-neutral-600">Students</div>
                  </div>
                </div>
              </div>
              
              {/* Floating accent cards */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-secondary-200 to-secondary-300 rounded-2xl shadow-xl rotate-12 opacity-90" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-primary-200 to-primary-300 rounded-2xl shadow-xl -rotate-12 opacity-90" />
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <Link href="#features" className="flex flex-col items-center text-neutral-500 hover:text-primary-600 transition-colors">
            <span className="text-sm mb-2 font-medium">Explore More</span>
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}