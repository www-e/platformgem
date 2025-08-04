// src/components/student/recommended-courses/CourseCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Star,
  Clock,
  Heart,
  Eye,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { 
  getRecommendationBadge, 
  getLevelBadge, 
  formatDuration, 
  formatPrice 
} from '@/lib/course-recommendation-utils';
import type { RecommendedCourse } from '@/hooks/useRecommendedCourses';

interface CourseCardProps {
  course: RecommendedCourse;
  onToggleWishlist: (courseId: string) => void;
}

export function CourseCard({ course, onToggleWishlist }: CourseCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
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
          onClick={() => onToggleWishlist(course.id)}
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
            {formatPrice(course.price, course.currency)}
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
  );
}