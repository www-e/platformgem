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
  TrendingUp
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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-neutral-200/80 bg-white overflow-hidden">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white/90 text-neutral-900">
              {course.category.name}
            </Badge>
          </div>

          <div className="absolute top-4 right-4">
            <Badge className="bg-white/90 text-neutral-900 font-semibold">
              {formatCoursePrice(course.price, course.currency)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors font-display">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-2 font-primary">
            بواسطة {course.professor.name}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonCount} درس</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.enrollmentCount} طالب</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>4.8</span>
          </div>
        </div>

        <Link href={`/courses/${course.id}`}>
          <Button className="w-full mt-2" variant="outline">
            <span>استكشف الدورة</span>
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
);

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <section className={cn('py-20 sm:py-32 bg-white', className)}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              عذراً، حدث خطأ في تحميل الدورات
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchFeaturedCourses} variant="outline">
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
      <section className={`py-20 bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-secondary rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-accent rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            الدورات الأكثر طلباً
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            ابدأ رحلتك التعليمية
            <span className="text-primary block mt-2">مع أحدث دوراتنا</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            اكتشف مجموعة مختارة من أفضل الدورات التعليمية التي تم تصميمها خصيصاً لمساعدتك على تحقيق أهدافك الأكاديمية والمهنية
          </p>
        </div>

        {/* Featured Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد دورات متاحة حالياً
              </h3>
              <p className="text-gray-600">
                نعمل على إضافة دورات جديدة قريباً. تابعنا للحصول على آخر التحديثات!
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              هل تريد استكشاف المزيد من الدورات؟
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              تصفح مكتبتنا الكاملة من الدورات التعليمية في مختلف المجالات واعثر على الدورة المثالية لك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="min-w-[200px]">
                  <BookOpen className="w-5 h-5 mr-2" />
                  تصفح جميع الدورات
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="min-w-[200px]">
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