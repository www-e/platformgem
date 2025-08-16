// src/components/course/CourseCard.tsx - Premium Course Card with 3D interactions
'use client';

import { UserRole } from '@prisma/client';
import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InstantLink } from '@/components/ui/instant-navigation';
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
  CheckCircle,
} from 'lucide-react';
import { formatCoursePrice } from '@/lib/course-utils';
import { cn } from '@/lib/utils';

// R.A.K.A.N: Kept the full original props for maximum flexibility
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
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);

  // 3D tilt effect logic is preserved
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

  const progress = userActions.isEnrolled ? (course.progress ?? Math.floor(Math.random() * 100)) : 0;

  // R.A.K.A.N: The 'list' view logic is fully preserved here.
  if (viewMode === 'list') {
    return (
      <motion.div
        className="group"
        whileHover={shouldReduceMotion ? {} : { scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative w-full sm:w-64 h-40 flex-shrink-0 overflow-hidden">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 256px"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                {showPreview && (
                  <motion.button
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setShowQuickPreview(true)}
                  >
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-primary ml-1" />
                    </div>
                  </motion.button>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/95 text-neutral-900 font-semibold shadow-sm">
                    {/* R.A.K.A.N: FIX #1 - Cast Decimal to number */}
                    {formatCoursePrice(course.price ? Number(course.price) : null, course.currency)}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{course.category.name}</Badge>
                    {userActions.isEnrolled && <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="w-3 h-3 ml-1" />مسجل</Badge>}
                  </div>
                  <div>
                    <InstantLink href={`/courses/${course.id}`} preloadOnHover>
                      <h3 className="font-bold text-lg leading-arabic-tight line-clamp-2 hover:text-primary transition-colors font-display">{course.title}</h3>
                    </InstantLink>
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{course.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div><span className="text-sm font-medium">{course.professor.name}</span></div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{course.enrollmentCount || 0}</span></div>
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{course.averageRating}</span></div>
                    </div>
                  </div>
                  {userActions.isEnrolled && (
                    <div className="space-y-1 pt-1"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">التقدم</span><span className="font-semibold text-primary">{progress}%</span></div><Progress value={progress} className="h-2" /></div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex-1">
                    {userActions.isEnrolled ? (
                      <Button variant="primary" size="sm" className="w-full" asChild><InstantLink href={`/courses/${course.id}`} preloadOnHover><Play className="w-4 h-4 ml-2" />متابعة التعلم</InstantLink></Button>
                    ) : (
                      <Button variant="primary" size="sm" className="w-full" onClick={handleEnroll} disabled={isLoading}>
                        <BookOpen className="w-4 h-4 ml-2" />
                        {/* R.A.K.A.N: FIX #2 - Cast Decimal to number */}
                        {course.price ? `التسجيل - ${formatCoursePrice(Number(course.price), course.currency)}` : 'التسجيل المجاني'}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {enableWishlist && <Button variant="ghost" size="icon-sm" onClick={handleWishlist} className={cn(isWishlisted && "text-red-500")}><Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} /></Button>}
                    {enableShare && <Button variant="ghost" size="icon-sm" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view with all original logic and effects preserved
  return (
    <motion.div
      ref={cardRef}
      className="group perspective-1000"
      style={{ rotateX: shouldReduceMotion ? 0 : rotateX, rotateY: shouldReduceMotion ? 0 : rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={shouldReduceMotion ? {} : { scale: 1.02, transition: { duration: 0.3 } }}
    >
      <Card className="overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
            animate={isHovered ? { translateX: "200%" } : { translateX: "-100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {enableWishlist && <motion.button className={cn("w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md", isWishlisted ? "text-red-500" : "text-neutral-600 hover:text-red-500")} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleWishlist}><Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} /></motion.button>}
            {enableShare && <motion.button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md text-neutral-600 hover:text-primary" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShare}><Share2 className="w-4 h-4" /></motion.button>}
          </div>
          {showPreview && <motion.button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setShowQuickPreview(true)}><div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg"><Play className="w-6 h-6 text-primary ml-1" /></div></motion.button>}
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/95 text-neutral-900 font-semibold shadow-sm">
              {/* R.A.K.A.N: FIX #3 - Cast Decimal to number */}
              {formatCoursePrice(course.price ? Number(course.price) : null, course.currency)}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3"><Badge variant="secondary">{course.category.name}</Badge></div>
          {userActions.isEnrolled && <div className="absolute bottom-3 right-3"><Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 ml-1" />مسجل</Badge></div>}
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <div className="flex-grow space-y-3">
            <InstantLink href={`/courses/${course.id}`} preloadOnHover><h3 className="font-bold text-base leading-arabic-tight line-clamp-2 hover:text-primary transition-colors font-display">{course.title}</h3></InstantLink>
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center"><Award className="w-4 h-4 text-primary" /></div><span className="text-sm font-medium text-muted-foreground">{course.professor.name}</span></div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /><span>{course.enrollmentCount || 0}</span></div>
              <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{course.totalDuration} دقيقة</span></div>
              <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span>{course.averageRating}</span></div>
            </div>
          </div>
          {userActions.isEnrolled && (
            <div className="space-y-1 pt-3"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">التقدم</span><span className="font-semibold text-primary">{progress}%</span></div><Progress value={progress} className="h-2" /></div>
          )}
          <div className="pt-4 mt-auto">
            {userActions.isEnrolled ? (
              <Button variant="primary" className="w-full" asChild><InstantLink href={`/courses/${course.id}`} preloadOnHover><Play className="w-4 h-4 ml-2" />متابعة التعلم</InstantLink></Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={handleEnroll} disabled={isLoading}>
                <BookOpen className="w-4 h-4 ml-2" />
                {/* R.A.K.A.N: FIX #4 - Cast Decimal to number */}
                {course.price ? `التسجيل - ${formatCoursePrice(Number(course.price), course.currency)}` : 'التسجيل المجاني'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}