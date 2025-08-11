// src/components/student/recommended-courses/CourseCard.tsx
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Users, 
  Star,
  Clock,
  Heart,
  Eye,
  ShoppingCart,
  Play,
  Share2,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RecommendedCourse } from '@/hooks/useRecommendedCourses';

interface CourseCardProps {
  course: RecommendedCourse;
  onToggleWishlist: (courseId: string) => void;
  index?: number;
}

const levelColors = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  advanced: 'bg-red-100 text-red-700 border-red-200'
};

const levelLabels = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم'
};

const recommendationBadges = {
  category_match: { icon: Target, label: 'يناسب اهتماماتك', color: 'bg-blue-500' },
  similar_students: { icon: Users, label: 'اختيار الملتحقين', color: 'bg-green-500' },
  trending: { icon: TrendingUp, label: 'رائج الآن', color: 'bg-pink-500' },
  professor_match: { icon: Award, label: 'مدرس مميز', color: 'bg-purple-500' },
  completion_based: { icon: Sparkles, label: 'مقترح لك', color: 'bg-orange-500' }
};

export function CourseCard({ course, onToggleWishlist, index = 0 }: CourseCardProps) {
  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'مجاني';
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  const RecommendationBadge = recommendationBadges[course.recommendationReason];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-white/90 backdrop-blur-sm overflow-hidden group-hover:scale-[1.02] relative">
        {/* Trending/Popular badges */}
        <div className="absolute top-3 left-3 z-10">
          <Badge className={cn("text-white border-0 shadow-lg flex items-center gap-1", RecommendationBadge.color)}>
            <RecommendationBadge.icon className="w-3 h-3" />
            {RecommendationBadge.label}
          </Badge>
        </div>

        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden relative">
            {course.thumbnailUrl ? (
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                <BookOpen className="w-16 h-16 text-primary/40" />
              </div>
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl"
            >
              <Play className="w-6 h-6 text-primary ml-1" />
            </motion.div>
          </div>
          
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            {course.price === 0 ? (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                مجاني
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-lg">
                {formatPrice(course.price, course.currency)}
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-8 h-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
              onClick={(e) => {
                e.preventDefault();
                onToggleWishlist(course.id);
              }}
            >
              <Heart className={cn(
                "w-4 h-4 transition-colors",
                course.isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
              )} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-8 h-8 p-0 bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Category and Level */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {course.category.name}
              </Badge>
              <Badge className={cn("text-xs", levelColors[course.level])}>
                {levelLabels[course.level]}
              </Badge>
            </div>

            {/* Course title and description */}
            <div>
              <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors mb-2 leading-tight">
                {course.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Professor info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                <AvatarImage src="" alt={course.professor.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary text-sm font-semibold">
                  {course.professor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{course.professor.name}</p>
                <p className="text-xs text-muted-foreground">مدرب معتمد</p>
              </div>
            </div>

            {/* Course stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollmentCount.toLocaleString('ar-EG')}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{course.rating.toFixed(1)}</span>
                </div>
              </div>
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

            {/* Action button */}
            <Link href={`/courses/${course.id}`}>
              <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                <Eye className="w-4 h-4 ml-2" />
                عرض التفاصيل
                <ChevronRight className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}