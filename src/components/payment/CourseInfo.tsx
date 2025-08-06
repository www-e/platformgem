// src/components/payment/CourseInfo.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/lib/api/courses";
import { 
  Play, 
  Clock, 
  Users, 
  Star,
  BookOpen
} from "lucide-react";

interface CourseInfoProps {
  course: Course;
}

export function CourseInfo({ course }: CourseInfoProps) {
  const formatPrice = () => {
    if (!course.price) return 'مجاني';
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(course.price));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Image */}
          <div className="aspect-video rounded-lg overflow-hidden">
            <img 
              src={course.thumbnailUrl} 
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
              }}
            />
          </div>

          {/* Course Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg leading-tight">
              {course.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>بواسطة: {course.professor.name}</span>
            </div>

            <Badge variant="outline" className="w-fit">
              {course.category.name}
            </Badge>

            {course.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>
            )}
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                <span>{course._count.lessons} درس</span>
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>شهادة إتمام</span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">السعر:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Assurance */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium">دفع آمن ومحمي</span>
            </div>
            <p className="text-xs text-muted-foreground">
              جميع المعاملات محمية بتشفير SSL
            </p>
          </div>
        </CardContent>
      </Card>

      {/* What You'll Get */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ما ستحصل عليه</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span>وصول مدى الحياة للدورة</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span>جميع الدروس والمواد</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span>شهادة إتمام معتمدة</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
            </div>
            <span>دعم فني مباشر</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}