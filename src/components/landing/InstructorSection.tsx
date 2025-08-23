// src/components/landing/InstructorSection.tsx
'use client';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { 
  GraduationCap, 
  Award, 
  Users, 
  Star, 
  BookOpen, 
  Clock,
  ArrowLeft,
  CheckCircle,
  Trophy,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const StatCard = ({ 
  icon: Icon, 
  value, 
  label,
  accent = "primary" 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string;
  accent?: "primary" | "secondary" | "success";
}) => (
  <div className="glass-medium rounded-2xl p-6 text-center border border-white/30 card-hover-effect group">
    <div className={cn(
      "w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-elevation-2 group-hover:shadow-elevation-3 transition-all duration-300",
      accent === "primary" && "bg-gradient-to-br from-primary-400 to-primary-500 text-black",
      accent === "secondary" && "bg-gradient-to-br from-secondary-400 to-secondary-500 text-black",
      accent === "success" && "bg-gradient-to-br from-emerald-400 to-emerald-500 text-black"
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="text-3xl font-bold text-neutral-800 font-display mb-2">
      {value}
    </div>
    <div className="text-sm text-neutral-600 font-medium">
      {label}
    </div>
  </div>
);

const ExpertiseCard = ({ 
  title, 
  items 
}: { 
  title: string; 
  items: string[];
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-neutral-200/50 card-hover-effect">
    <h4 className="text-lg font-bold text-neutral-800 font-display mb-4 leading-arabic-tight">
      {title}
    </h4>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
          <span className="text-neutral-700 text-sm leading-arabic-normal">
            {item}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default function InstructorSection() {
  const expertiseAreas = [
    {
      title: "Academic Curricula",
      items: [
        "Physics for First Year Secondary",
        "Physics for Second Year Secondary", 
        "Physics for Third Year Secondary",
        "Comprehensive Reviews for Final Exams"
      ]
    },
    {
      title: "Teaching Methods",
      items: [
        "Detailed Explanation of Complex Concepts",
        "Step-by-Step Problem Solving",
        "Intensive Training on Exam Questions",
        "Individual Follow-up for Each Student"
      ]
    }
  ];

  return (
    <section id="instructor" className="section-padding bg-gradient-to-br from-white via-neutral-50/30 to-primary-50/20 relative overflow-hidden">
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/40 to-primary-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-16 w-24 h-24 bg-gradient-to-br from-secondary-200/40 to-secondary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-primary-100/50 to-primary-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <GraduationCap className="w-4 h-4" />
            Trusted Educational Experience
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-tight">
            <span className="text-neutral-800">Get to Know</span>
            <br />
            <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
              The Physics Expert
            </span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            A specialized teacher with years of experience simplifying complex concepts and preparing students for exam excellence
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Text Content */}
          <div className="order-2 lg:order-1 space-y-8">
            
            {/* Instructor Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-elevation-3">
                  <GraduationCap className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary-700 font-display leading-tight">
                    Engineer in Physics
                  </h3>
                  <Badge className="glass-light border-0 text-neutral-700 font-semibold mt-2">
                    <Award className="w-3 h-3 mr-1" />
                    Certified Teaching Expert
                  </Badge>
                </div>
              </div>

              <p className="text-lg text-neutral-700 leading-relaxed">
                Specialized in teaching physics for all stages of secondary school with extensive experience. I provide detailed and simplified explanations focused on building a deep understanding of physical concepts, with practical solutions to difficult problems and intensive training on exam questions, ensuring your complete readiness and excellence.
              </p>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard 
                icon={Users} 
                value="500+" 
                label="Graduated Students"
                accent="primary"
              />
              <StatCard 
                icon={Trophy} 
                value="95%" 
                label="Success Rate"
                accent="secondary"
              />
              <StatCard 
                icon={Star} 
                value="4.9" 
                label="Student Ratings"
                accent="success"
              />
              <StatCard 
                icon={Clock} 
                value="5+" 
                label="Years Experience"
                accent="primary"
              />
            </div>

            {/* Call to Action */}
            <div className="pt-6">
              <Button 
                size="xl" 
                className="h-14 px-10 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-bold rounded-xl shadow-elevation-3 hover:shadow-elevation-4 btn-hover-effect relative overflow-hidden group"
                asChild
              >
                <Link href="/courses">
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    <BookOpen className="w-5 h-5" />
                    <span>Browse Available Courses</span>
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Enhanced Image Section */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-primary-200/30 to-secondary-100/30 rounded-3xl blur-3xl transform rotate-6"></div>
              
              {/* Main image container */}
              <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-elevation-4">
                <div className="aspect-square relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
                  <Image 
                    src="/omar.png" 
                    alt="Image of the Physics Engineer" 
                    fill
                    className="object-contain p-4"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 left-4">
                    <Badge className="glass-medium border-0 text-neutral-800 font-semibold shadow-elevation-2">
                      <Star className="w-3 h-3 mr-1 text-secondary-500" />
                      Outstanding Teacher
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Badge className="glass-medium border-0 text-neutral-800 font-semibold shadow-elevation-2">
                      <Target className="w-3 h-3 mr-1 text-primary-500" />
                      Guaranteed Results
                    </Badge>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-secondary-400 to-secondary-500 rounded-full shadow-elevation-2 animate-float"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full shadow-elevation-2 animate-float" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Expertise Areas */}
        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-800 font-display mb-4 leading-tight">
              Areas of Expertise
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Comprehensive specialization in all aspects of physics teaching with a focus on practical results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {expertiseAreas.map((area, index) => (
              <ExpertiseCard key={index} {...area} />
            ))}
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="glass-medium rounded-3xl p-12 shadow-elevation-4 border border-white/30 max-w-4xl mx-auto">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-neutral-800 font-display mb-4 leading-arabic-tight">
               Wanna be the next success story?
              </h3>
              <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-arabic-relaxed">
                Join hundreds of students who have achieved excellence with expert guidance and proven methods. Your success journey starts here!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/courses">
                <Button 
                  size="xl" 
                  className="min-w-[220px] h-14 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-black font-bold rounded-xl shadow-elevation-3 hover:shadow-elevation-4 btn-hover-effect"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Start Your Course Now
                </Button>
              </Link>
              
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">A</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">S</div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full border-2 border-white flex items-center justify-center text-black text-sm font-bold">M</div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Outstanding Students</p>
                  <p className="text-xs text-neutral-500">Achieved Excellence</p>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-8 pt-8 border-t border-neutral-200/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary-600 font-display">Proven Expertise</div>
                  <div className="text-sm text-neutral-600">In Teaching & Preparation</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-secondary-600 font-display">Personal Follow-up</div>
                  <div className="text-sm text-neutral-600">For Each Student</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary-600 font-display">Guaranteed Results</div>
                  <div className="text-sm text-neutral-600">Or Money Back</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
