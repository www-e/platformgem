// src/components/course/CourseCard.tsx - Premium Course Card with 3D interactions
'use client';

import { UserRole } from '@prisma/client';
import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InstantLink } from '@/components/ui/instant-navigation';
import { HoverLift, PressScale, GlowHover } from '@/components/ui/micro-interactions';
import { CourseWithMetadata } from '@/types/course';
import { useCourseCard } from '@/hooks/useCourseCard';
import { useOptimizedMotion } from '@/hooks/useAnimations';
import { 
  Play, 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  Award, 
  Heart,
  Share2,
  Eye,
  CheckCircle,
  Bookmark,
  TrendingUp,
  Zap
} from 'lucide-react';
import { formatCoursePrice } from '@/lib/course-utils';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userId?: string;
  viewMode?: 'grid' | 'list' | 'featured';
  showPreview?: boolean;
  enableWishlist?: boolean;
  enableShare?: boolean;
}

export default function CourseCard({ 
  course, 
  userRole, 
  userId, 
  viewMode = 'grid',
  showPreview = true,
  enableWishlist = true,
  enableShare = true
}: CourseCardProps) {
  const { isLoading, userActions, handleEnroll } = useCourseCard(course, userRole, userId);
  const { shouldReduceMotion } = useOptimizedMotion();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  
  // 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 400, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set((e.clientX - centerX) / rect.width);
    mouseY.set((e.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: `/courses/${course.id}`
      });
    }
  };

  // Calculate progress for enrolled courses
  const progress = userActions.isEnrolled ? Math.floor(Math.random() * 100) : 0;

  if (viewMode === 'list') {
    return (
      <motion.div
        className="group"
        whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-elevation-2 hover:shadow-elevation-4 transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex">
              {/* Course Image */}
              <div className="relative w-64 h-40 flex-shrink-0 overflow-hidden">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                
                {/* Quick Preview Button */}
                {showPreview && (
                  <motion.button
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowQuickPreview(true)}
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-elevation-3">
                      <Play className="w-6 h-6 text-primary-600 ml-1" />
                    </div>
                  </motion.button>
                )}

                {/* Price Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={course.price === null ? "secondary" : "default"}
                    className="bg-white/95 text-neutral-900 font-semibold shadow-elevation-2"
                  >
                    {formatCoursePrice(course.price, course.currency)}
                  </Badge>
                </div>
              </div>

              {/* Course Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Category & Status */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-primary">
                      {course.category.name}
                    </Badge>
                    {userActions.isEnrolled && (
                      <Badge className="bg-success text-white text-xs">
                        <CheckCircle className="w-3 h-3 ml-1" />
                        مسجل
                      </Badge>
                    )}
                  </div>
                  
                  {/* Title & Description */}
                  <div>
                    <InstantLink href={`/courses/${course.id}`} preloadOnHover>
                      <h3 className="font-bold text-xl leading-arabic-tight line-clamp-2 hover:text-primary-600 transition-colors font-display">
                        {course.title}
                      </h3>
                    </InstantLink>
                    <p className="text-neutral-600 text-sm line-clamp-2 leading-arabic-relaxed mt-2 font-primary">
                      {course.description}
                    </p>
                  </div>

                  {/* Professor & Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-neutral-700 font-primary">
                        {course.professor.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span className="font-primary">{course.enrollmentCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-primary">4.8</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress for enrolled courses */}
                  {userActions.isEnrolled && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600 font-primary">التقدم</span>
                        <span className="text-primary-600 font-semibold font-primary">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1">
                    {userActions.isEnrolled ? (
                      <Button variant="primary" size="sm" className="w-full" asChild>
                        <InstantLink href={`/courses/${course.id}`} preloadOnHover>
                          <Play className="w-4 h-4 ml-2" />
                          متابعة التعلم
                        </InstantLink>
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full" 
                        onClick={handleEnroll}
                        loading={isLoading}
                      >
                        <BookOpen className="w-4 h-4 ml-2" />
                        {course.price ? `التسجيل - ${formatCoursePrice(course.price, course.currency)}` : 'التسجيل المجاني'}
                      </Button>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1">
                    {enableWishlist && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleWishlist}
                        className={cn(
                          "transition-colors",
                          isWishlisted && "text-red-500 hover:text-red-600"
                        )}
                      >
                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                      </Button>
                    )}
                    
                    {enableShare && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={handleShare}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view with 3D tilt effect
  return (
    <motion.div
      ref={cardRef}
      className="group perspective-1000"
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
    >
      <Card className="overflow-hidden border-0 shadow-elevation-2 hover:shadow-elevation-5 transition-all duration-300 will-change-transform">
        {/* Course Image */}
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Quick Actions Overlay */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {enableWishlist && (
              <motion.button
                className={cn(
                  "w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-elevation-2 transition-colors",
                  isWishlisted ? "text-red-500" : "text-neutral-600 hover:text-red-500"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlist}
              >
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
              </motion.button>
            )}
            
            {enableShare && (
              <motion.button
                className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-elevation-2 text-neutral-600 hover:text-primary-600 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </motion.button>
            )}
          </div>

          {/* Preview Button */}
          {showPreview && (
            <motion.button
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQuickPreview(true)}
            >
              <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-elevation-4">
                <Play className="w-6 h-6 text-primary-600 ml-1" />
              </div>
            </motion.button>
          )}

          {/* Price Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant={course.price === null ? "secondary" : "default"}
              className="bg-white/95 text-neutral-900 font-semibold shadow-elevation-2"
            >
              {formatCoursePrice(course.price, course.currency)}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary" className="text-white border-white/20">
              {course.category.name}
            </Badge>
          </div>

          {/* Enrollment Status */}
          {userActions.isEnrolled && (
            <div className="absolute bottom-3 right-3">
              <Badge className="bg-success text-white shadow-elevation-2">
                <CheckCircle className="w-3 h-3 ml-1" />
                مسجل
              </Badge>
            </div>
          )}
        </div>

        {/* Course Content */}
        <CardContent className="p-6 space-y-4">
          {/* Title & Description */}
          <div className="space-y-2">
            <InstantLink href={`/courses/${course.id}`} preloadOnHover>
              <h3 className="font-bold text-lg leading-arabic-tight line-clamp-2 hover:text-primary-600 transition-colors font-display group-hover:text-primary-600">
                {course.title}
              </h3>
            </InstantLink>
            <p className="text-neutral-600 text-sm line-clamp-2 leading-arabic-relaxed font-primary">
              {course.description}
            </p>
          </div>

          {/* Professor */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-neutral-700 font-primary">
              {course.professor.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-neutral-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span className="font-primary">{course.enrollmentCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="font-primary">12 ساعة</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-primary font-medium">4.8</span>
            </div>
          </div>

          {/* Progress for enrolled courses */}
          {userActions.isEnrolled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600 font-primary">التقدم</span>
                <span className="text-primary-600 font-semibold font-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {userActions.isEnrolled ? (
              <Button variant="primary" className="w-full" asChild>
                <InstantLink href={`/courses/${course.id}`} preloadOnHover>
                  <Play className="w-4 h-4 ml-2" />
                  متابعة التعلم
                </InstantLink>
              </Button>
            ) : (
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={handleEnroll}
                loading={isLoading}
              >
                <BookOpen className="w-4 h-4 ml-2" />
                {course.price ? `التسجيل - ${formatCoursePrice(course.price, course.currency)}` : 'التسجيل المجاني'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}