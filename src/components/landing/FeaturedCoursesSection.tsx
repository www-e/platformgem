// src/components/landing/FeaturedCoursesSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  ArrowLeft,
  Play,
  Award,
  TrendingUp,
  Sparkles,
  Target
} from 'lucide-react';
import { FeaturedCourse } from '@/types/course';
import { formatCoursePrice, formatCourseDuration } from '@/lib/course-utils';
import { StructuredData } from '@/components/seo/StructuredData';
import { cn } from '@/lib/utils';

interface FeaturedCoursesSectionProps {
  className?: string;
}

export default function FeaturedCoursesSection({ className = '' }: FeaturedCoursesSectionProps) {
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await fetch('/api/courses/featured');
      if (!response.ok) {
        throw new Error('Failed to fetch featured courses');
      }
      const data = await response.json();
      setCourses(data.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الدورات');
    } finally {
      setIsLoading(false);
    }
  };

  const CourseCard = ({ course }: { course: FeaturedCourse }) => (
    <Card className="group relative overflow-hidden bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-2xl card-hover-effect shadow-elevation-2 hover:shadow-elevation-4">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-primary-100/0 to-primary-200/0 group-hover:from-primary-50/30 group-hover:via-primary-100/20 group-hover:to-primary-200/10 transition-all duration-500 rounded-2xl" />
      
      <CardHeader className="p-0 relative">
        <div className="aspect-video relative overflow-hidden rounded-t-2xl">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/60 via-neutral-900/20 to-transparent" />
          
          {/* Floating category badge */}
          <div className="absolute top-4 left-4">
            <Badge className="glass-medium border-0 text-neutral-800 font-semibold px-3 py-1">
              {course.category.name}
            </Badge>
          </div>

          {/* Premium price badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-gradient-to-r from-secondary-400 to-secondary-500 text-white border-0 font-bold px-3 py-1 shadow-elevation-2">
              {formatCoursePrice(course.price, course.currency)}
            </Badge>
          </div>

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Play className="w-8 h-8 text-white mr-1" fill="currentColor" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4 relative z-10">
        {/* Course title and instructor */}
        <div className="space-y-2">
          <h3 className="font-bold text-xl leading-arabic-tight line-clamp-2 group-hover:text-primary-700 transition-colors font-display">
            {course.title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {course.professor.name.charAt(0)}
            </div>
            <p className="text-neutral-600 text-sm font-medium">
              بواسطة {course.professor.name}
            </p>
          </div>
        </div>

        {/* Enhanced stats section */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-neutral-200/50">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4 text-primary-500" />
            </div>
            <div className="text-sm font-semibold text-neutral-800">{course.lessonCount}</div>
            <div className="text-xs text-neutral-500">درس</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-secondary-500" />
            </div>
            <div className="text-sm font-semibold text-neutral-800">{course.enrollmentCount}</div>
            <div className="text-xs text-neutral-500">طالب</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-sm font-semibold text-neutral-800">4.9</div>
            <div className="text-xs text-neutral-500">تقييم</div>
          </div>
        </div>

        {/* Enhanced CTA button */}
        <Link href={`/courses/${course.id}`} className="block">
          <Button className="w-full h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl shadow-elevation-2 hover:shadow-elevation-3 btn-hover-effect relative overflow-hidden group/btn">
            <span className="flex items-center justify-center gap-2 relative z-10">
              <span>استكشف الدورة</span>
              <ArrowLeft className="w-5 h-5 transition-transform group-hover/btn:-translate-x-1" />
            </span>
            {/* Shimmer effect */}
            <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden bg-white/60 backdrop-blur-sm border border-neutral-200/50 rounded-2xl">
      <Skeleton className="aspect-video w-full rounded-t-2xl" />
      <CardHeader className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-neutral-200/50">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <section className={cn('section-padding bg-gradient-to-br from-neutral-50 to-primary-50/30', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-800 mb-2">
              عذراً، حدث خطأ في تحميل الدورات
            </h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <Button onClick={fetchFeaturedCourses} variant="outline" className="btn-hover-effect">
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <StructuredData courses={courses} />
      <section className={cn('section-padding bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 relative overflow-hidden', className)}>
        
        {/* Enhanced background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-200/40 to-primary-300/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-br from-secondary-200/40 to-secondary-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-gradient-to-br from-primary-100/50 to-primary-200/30 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              الدورات الأكثر طلباً
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold font-display mb-6 leading-arabic-tight">
              <span className="text-neutral-800">ابدأ رحلتك التعليمية</span>
              <br />
              <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 bg-clip-text text-transparent">
                مع أحدث دوراتنا
              </span>
            </h2>
            
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-arabic-relaxed">
              اكتشف مجموعة مختارة من أفضل الدورات التعليمية التي تم تصميمها خصيصاً لمساعدتك على تحقيق أهدافك الأكاديمية والمهنية
            </p>
          </div>

          {/* Modern courses grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <LoadingSkeleton key={i} />
              ))
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-2">
                  لا توجد دورات متاحة حالياً
                </h3>
                <p className="text-neutral-600">
                  نعمل على إضافة دورات جديدة قريباً. تابعنا للحصول على آخر التحديثات!
                </p>
              </div>
            )}
          </div>

          {/* Enhanced CTA section */}
          <div className="text-center">
            <div className="glass-medium rounded-3xl p-8 shadow-elevation-3 border border-white/30 max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary-500" />
                <h3 className="text-2xl font-bold text-neutral-800 font-display">
                  هل تريد استكشاف المزيد من الدورات؟
                </h3>
              </div>
              <p className="text-neutral-600 mb-8 max-w-2xl mx-auto leading-arabic-relaxed">
                تصفح مكتبتنا الكاملة من الدورات التعليمية في مختلف المجالات واعثر على الدورة المثالية لك
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button size="lg" className="min-w-[200px] h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl shadow-elevation-2 hover:shadow-elevation-3 btn-hover-effect">
                    <BookOpen className="w-5 h-5 mr-2" />
                    تصفح جميع الدورات
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="min-w-[200px] h-12 glass-light border-2 border-neutral-200/50 text-neutral-700 hover:border-primary/30 hover:text-primary font-bold rounded-xl btn-hover-effect">
                    <Target className="w-5 h-5 mr-2" />
                    إنشاء حساب مجاني
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
