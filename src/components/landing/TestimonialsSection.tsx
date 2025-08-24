// src/components/landing/TestimonialsSection.tsx
'use client';

import { useState } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight, User, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  grade: string;
  rating: number;
  achievement?: string;
  avatar?: string;
  school?: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "The explanation was excellent and straightforward. I was able to understand parts that were very difficult for me thanks to the teacher's simplified and clear approach. The result was beyond expectations!",
    name: "Ahmed Khalid",
    role: "High School Student",
    grade: "Third Year Secondary",
    rating: 5,
    achievement: "25% Improvement",
    school: "Al-Noor Secondary School"
  },
  {
    quote: "The platform is easy to use and enabled me to study anytime. The homework tracking and progress monitoring helped me better organize my time and achieve excellent results.",
    name: "Sara Mahmoud",
    role: "High School Student",
    grade: "Second Year Secondary",
    rating: 5,
    achievement: "Outstanding Grades",
    school: "Future Secondary School"
  },
  {
    quote: "The interactive teaching style and practical examples made physics an enjoyable subject for me. Now I understand concepts in greater depth and solve problems with more confidence.",
    name: "Mohamed Ahmed",
    role: "High School Student",
    grade: "Third Year Secondary",
    rating: 5,
    achievement: "95% on Exam",
    school: "Al-Ruwad Secondary School"
  },
  {
    quote: "The continuous support and personal follow-up from the teacher made the real difference. I felt confident and fully prepared for the final exams.",
    name: "Fatima Ali",
    role: "High School Student", 
    grade: "Third Year Secondary",
    rating: 5,
    achievement: "Admitted to University",
    school: "Al-Amal Secondary School"
  }
];

const TestimonialCard = ({ 
  testimonial, 
  isActive = false 
}: { 
  testimonial: Testimonial;
  isActive?: boolean;
}) => (
  <div className={cn(
    "relative bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-2xl p-8 card-hover-effect shadow-elevation-2 hover:shadow-elevation-4 group transition-all duration-300",
    isActive && "ring-2 ring-primary/20 bg-white/80"
  )}>
    {/* Background gradient on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-100/0 to-primary-200/0 group-hover:from-primary-50/30 group-hover:via-primary-100/20 group-hover:to-primary-200/10 transition-all duration-500 rounded-2xl" />
    
    {/* Quote icon */}
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-elevation-2 group-hover:shadow-elevation-3 transition-all duration-300">
          <Quote className="w-6 h-6 text-black" />
        </div>
        
        {testimonial.achievement && (
          <Badge className="glass-light border-0 text-neutral-700 font-semibold">
            <Award className="w-3 h-3 mr-1" />
            {testimonial.achievement}
          </Badge>
        )}
      </div>

      {/* Quote text */}
      <blockquote className="text-lg text-neutral-700 leading-relaxed mb-6 font-medium">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={cn(
                "w-5 h-5 transition-colors",
                i < testimonial.rating 
                  ? "text-amber-400 fill-amber-400" 
                  : "text-neutral-300"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-neutral-500 mr-2">({testimonial.rating}/5)</span>
      </div>

      {/* Student info */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full flex items-center justify-center shadow-elevation-1">
          {testimonial.avatar ? (
            <img 
              src={testimonial.avatar} 
              alt={testimonial.name}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-6 h-6 text-neutral-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className="font-bold text-neutral-800 text-lg font-display leading-tight">
            {testimonial.name}
          </h4>
          <p className="text-sm text-neutral-600 mb-1">
            {testimonial.role}
          </p>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-primary-600 font-medium">
              {testimonial.grade}
            </span>
            {testimonial.school && (
              <span className="text-xs text-neutral-500">
                {testimonial.school}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials every 5 seconds
  useState(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  });

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section id="testimonials" className="section-padding bg-gradient-to-br from-neutral-50 via-white to-secondary-50/30 relative overflow-hidden">
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-16 right-10 w-32 h-32 bg-gradient-to-br from-secondary-200/40 to-secondary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 left-16 w-24 h-24 bg-gradient-to-br from-primary-200/40 to-primary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/3 left-1/4 w-20 h-20 bg-gradient-to-br from-primary-100/50 to-primary-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Enhanced section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Success Stories
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            <span className="text-neutral-800">What Do Our</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              Outstanding Students Say?
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Discover how our platform has helped hundreds of students achieve their academic dreams and reach the highest grades
          </p>
        </div>

        {/* Main testimonial display */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative">
            <TestimonialCard 
              testimonial={testimonials[currentIndex]} 
              isActive={true}
            />
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrev}
            className="w-12 h-12 rounded-full border-2 border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5 btn-hover-effect"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dot indicators */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "bg-primary-500 w-8"
                    : "bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            className="w-12 h-12 rounded-full border-2 border-neutral-200/50 hover:border-primary/30 hover:bg-primary/5 btn-hover-effect"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats section */}
        <div className="mt-16">
          <div className="glass-medium rounded-3xl p-8 shadow-elevation-3 border border-white/30 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary-600 font-display">
                  500+
                </div>
                <div className="text-neutral-600 font-medium">Attenders</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-secondary-600 font-display">
                  4.9/5
                </div>
                <div className="text-neutral-600 font-medium">Average Score </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary-600 font-display">
                  95%
                </div>
                <div className="text-neutral-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
