// src/components/course/CourseCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserRole } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Play,
  Edit,
  Settings,
  ArrowLeft,
  Award,
  CheckCircle
} from 'lucide-react';
import { CourseWithMetadata } from '@/types/course';
import { formatCoursePrice, formatCourseDuration, getCourseUserActions } from '@/lib/course-utils';

interface CourseCardProps {
  course: CourseWithMetadata;
  userRole?: UserRole;
  userId?: string;
  viewMode?: 'grid' | 'list';
}

export default function CourseCard({ course, userRole, userId, viewMode = 'grid' }: CourseCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const userActions = getCourseUserActions(course, userRole, userId);

  const handleEnroll = async () => {
    if (!userId) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      // Check if course is free or paid
      const isFree = !course.price || course.price <= 0;
      
      if (isFree) {
        // Free enrollment
        const response = await fetch(`/api/courses/${course.id}/enroll-enhanced`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enrollmentType: 'free'
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Redirect to course content
          window.location.href = result.redirectTo || `/courses/${course.id}`;
        } else {
          console.error('Free enrollment failed:', result.error);
          // You can show a toast notification here
        }
      } else {
        // Paid course - redirect to payment
        window.location.href = `/courses/${course.id}/payment`;
      }
    } catch (error) {
      console.error('Enrollment failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ActionButton = () => {
    if (!userRole) {
      // Unauthenticated user
      return (
        <Link href="/signup">
          <Button className="w-full">
            إنشاء حساب للتسجيل
          </Button>
        </Link>
      );
    }

    if (userActions.isEnrolled) {
      // Enrolled student
      return (
        <Link href={`/courses/${course.id}`}>
          <Button className="w-full" variant="default">
            <Play className="w-4 h-4 mr-2" />
            متابعة التعلم
          </Button>
        </Link>
      );
    }

    if (userActions.canEnroll) {
      // Student can enroll
      return (
        <Button 
          className="w-full" 
          onClick={handleEnroll}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <BookOpen className="w-4 h-4 mr-2" />
          )}
          {course.price ? `التسجيل - ${formatCoursePrice(course.price, course.currency)}` : 'التسجيل المجاني'}
        </Button>
      );
    }

    if (userActions.canEdit) {
      // Professor/Admin can edit
      return (
        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              عرض
            </Button>
          </Link>
          <Link href={`/admin/courses/${course.id}`}>
            <Button className="flex-1">
              <Edit className="w-4 h-4 mr-2" />
              تحرير
            </Button>
          </Link>
        </div>
      );
    }

    if (userActions.canManage) {
      // Admin can manage
      return (
        <div className="flex gap-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Play className="w-4 h-4 mr-2" />
              عرض
            </Button>
          </Link>
          <Link href={`/admin/courses/${course.id}`}>
            <Button className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              إدارة
            </Button>
          </Link>
        </div>
      );
    }

    // Default view button
    return (
      <Link href={`/courses/${course.id}`}>
        <Button className="w-full" variant="outline">
          <Play className="w-4 h-4 mr-2" />
          عرض التفاصيل
        </Button>
      </Link>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex gap-6">
            {/* Course Image */}
            <div className="relative w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="192px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Price Badge */}
              <div className="absolute top-2 right-2">
                <Badge 
                  variant={course.price === null ? "secondary" : "default"}
                  className="bg-white/90 text-gray-900 hover:bg-white font-semibold"
                >
                  {formatCoursePrice(course.price, course.currency)}
                </Badge>
              </div>
            </div>

            {/* Course Info */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {course.category.name}
                  </Badge>
                  {userActions.isEnrolled && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      مسجل
                    </Badge>
                  )}
                </div>
                
                <h3 className="font-bold text-xl leading-tight line-clamp-2 hover:text-primary transition-colors">
                  {course.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mt-2">
                  {course.description}
                </p>
              </div>

              {/* Professor Info */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {course.professor.name}
                </span>
              </div>

              {/* Course Stats */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course.lessonCount} درس</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatCourseDuration(course.totalDuration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.enrollmentCount} طالب</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{course.averageRating} ({course.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="w-48 flex-shrink-0 flex items-end">
              <ActionButton />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-primary ml-1" />
            </div>
          </div>

          {/* Price Badge */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant={course.price === null ? "secondary" : "default"}
              className="bg-white/90 text-gray-900 hover:bg-white font-semibold"
            >
              {formatCoursePrice(course.price, course.currency)}
            </Badge>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="outline" className="bg-primary/90 text-white border-white/20">
              {course.category.name}
            </Badge>
          </div>

          {/* Enrollment Status */}
          {userActions.isEnrolled && (
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-green-500/90 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                مسجل
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Professor Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {course.professor.name}
            </span>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.lessonCount} درس</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatCourseDuration(course.totalDuration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollmentCount} طالب</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{course.averageRating}</span>
            </div>
          </div>

          {/* Action Button */}
          <ActionButton />
        </CardContent>
      </div>
    </Card>
  );
}