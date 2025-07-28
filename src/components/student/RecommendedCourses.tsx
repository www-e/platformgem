// src/components/student/RecommendedCourses.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  Heart,
  Filter,
  Sparkles,
  Target,
  Award,
  Eye,
  ShoppingCart
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: {
    id: string;
    name: string;
    slug: string;
  };
  professor: {
    id: string;
    name: string;
    expertise: string[];
  };
  lessons: {
    id: string;
    title: string;
    duration: number;
  }[];
  tags: string[];
  recommendationReason: 'category_match' | 'similar_students' | 'trending' | 'professor_match' | 'completion_based';
  recommendationScore: number;
  isWishlisted: boolean;
  previewVideoUrl?: string;
}

interface RecommendationFilters {
  category: string;
  priceRange: string;
  level: string;
  duration: string;
  rating: string;
}

export function RecommendedCourses() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: 'all',
    priceRange: 'all',
    level: 'all',
    duration: 'all',
    rating: 'all'
  });

  useEffect(() => {
    fetchRecommendedCourses();
  }, [filters]);

  const fetchRecommendedCourses = async () => {
    try {
      const queryParams = new URLSearchParams({
        category: filters.category,
        priceRange: filters.priceRange,
        level: filters.level,
        duration: filters.duration,
        rating: filters.rating
      });

      const response = await fetch(`/api/student/recommended-courses?${queryParams}`);
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch recommended courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (courseId: string) => {
    try {
      const response = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, isWishlisted: !course.isWishlisted }
            : course
        ));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const getRecommendationBadge = (reason: string) => {
    switch (reason) {
      case 'category_match':
        return <Badge className="bg-blue-100 text-blue-800"><Target className="h-3 w-3 mr-1" />مشابه لاهتماماتك</Badge>;
      case 'similar_students':
        return <Badge className="bg-green-100 text-green-800"><Users className="h-3 w-3 mr-1" />اختيار الطلاب</Badge>;
      case 'trending':
        return <Badge className="bg-orange-100 text-orange-800"><TrendingUp className="h-3 w-3 mr-1" />رائج الآن</Badge>;
      case 'professor_match':
        return <Badge className="bg-purple-100 text-purple-800"><Award className="h-3 w-3 mr-1" />من مدرس مفضل</Badge>;
      case 'completion_based':
        return <Badge className="bg-teal-100 text-teal-800"><Sparkles className="h-3 w-3 mr-1" />مقترح لك</Badge>;
      default:
        return <Badge variant="outline">مقترح</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Badge variant="outline" className="text-green-600 border-green-600">مبتدئ</Badge>;
      case 'intermediate':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">متوسط</Badge>;
      case 'advanced':
        return <Badge variant="outline" className="text-red-600 border-red-600">متقدم</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  const filteredCourses = courses.filter(course => {
    if (filters.category !== 'all' && course.category.id !== filters.category) return false;
    
    if (filters.priceRange !== 'all') {
      const price = course.price;
      switch (filters.priceRange) {
        case 'free':
          if (price > 0) return false;
          break;
        case 'under_100':
          if (price >= 100) return false;
          break;
        case '100_500':
          if (price < 100 || price >= 500) return false;
          break;
        case 'over_500':
          if (price < 500) return false;
          break;
      }
    }
    
    if (filters.level !== 'all' && course.level !== filters.level) return false;
    
    if (filters.duration !== 'all') {
      const duration = course.duration;
      switch (filters.duration) {
        case 'short':
          if (duration >= 120) return false; // Less than 2 hours
          break;
        case 'medium':
          if (duration < 120 || duration >= 480) return false; // 2-8 hours
          break;
        case 'long':
          if (duration < 480) return false; // More than 8 hours
          break;
      }
    }
    
    if (filters.rating !== 'all') {
      const rating = course.rating;
      const minRating = parseFloat(filters.rating);
      if (rating < minRating) return false;
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            الدورات المقترحة لك
          </h2>
          <p className="text-muted-foreground">
            دورات مختارة خصيصاً بناءً على اهتماماتك وتقدمك
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            تصفية النتائج
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="fitness">اللياقة البدنية</SelectItem>
                <SelectItem value="nutrition">التغذية</SelectItem>
                <SelectItem value="swimming">السباحة</SelectItem>
                <SelectItem value="diving">الغوص</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.priceRange} onValueChange={(value) => setFilters({...filters, priceRange: value})}>
              <SelectTrigger>
                <SelectValue placeholder="السعر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأسعار</SelectItem>
                <SelectItem value="free">مجاني</SelectItem>
                <SelectItem value="under_100">أقل من 100 جنيه</SelectItem>
                <SelectItem value="100_500">100 - 500 جنيه</SelectItem>
                <SelectItem value="over_500">أكثر من 500 جنيه</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.level} onValueChange={(value) => setFilters({...filters, level: value})}>
              <SelectTrigger>
                <SelectValue placeholder="المستوى" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="beginner">مبتدئ</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">متقدم</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.duration} onValueChange={(value) => setFilters({...filters, duration: value})}>
              <SelectTrigger>
                <SelectValue placeholder="المدة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدد</SelectItem>
                <SelectItem value="short">قصيرة (أقل من ساعتين)</SelectItem>
                <SelectItem value="medium">متوسطة (2-8 ساعات)</SelectItem>
                <SelectItem value="long">طويلة (أكثر من 8 ساعات)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.rating} onValueChange={(value) => setFilters({...filters, rating: value})}>
              <SelectTrigger>
                <SelectValue placeholder="التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التقييمات</SelectItem>
                <SelectItem value="4.5">4.5 نجوم فأكثر</SelectItem>
                <SelectItem value="4.0">4.0 نجوم فأكثر</SelectItem>
                <SelectItem value="3.5">3.5 نجوم فأكثر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Course Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
              {course.thumbnailUrl ? (
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/30" />
                </div>
              )}
              
              {/* Wishlist Button */}
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => toggleWishlist(course.id)}
              >
                <Heart className={`h-4 w-4 ${course.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </Button>

              {/* Recommendation Badge */}
              <div className="absolute top-2 left-2">
                {getRecommendationBadge(course.recommendationReason)}
              </div>

              {/* Price Badge */}
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-white/90 text-gray-900">
                  {course.price === 0 ? 'مجاني' : 
                    new Intl.NumberFormat('ar-EG', {
                      style: 'currency',
                      currency: course.currency,
                      minimumFractionDigits: 0
                    }).format(course.price)
                  }
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-yellow-600 shrink-0">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{course.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {course.category.name}
                </Badge>
                {getLevelBadge(course.level)}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount.toLocaleString('ar-EG')} طالب</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                </div>

                {/* Professor Info */}
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">المدرس: {course.professor.name}</span>
                </div>

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {course.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button asChild className="flex-1">
                    <Link href={`/courses/${course.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </Link>
                  </Button>
                  
                  {course.price > 0 ? (
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">لا توجد دورات مطابقة للمرشحات</h3>
          <p className="text-muted-foreground mb-4">
            جرب تغيير المرشحات للعثور على دورات مناسبة لك
          </p>
          <Button 
            variant="outline" 
            onClick={() => setFilters({
              category: 'all',
              priceRange: 'all',
              level: 'all',
              duration: 'all',
              rating: 'all'
            })}
          >
            إعادة تعيين المرشحات
          </Button>
        </div>
      )}
    </div>
  );
}