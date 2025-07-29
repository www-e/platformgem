// src/app/courses/[courseId]/page.tsx
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CourseAccessGuard } from "@/components/course/CourseAccessGuard";
import { CourseContent } from "@/components/course/CourseContent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Calendar,
  User,
  Tag
} from "lucide-react";

interface CoursePageProps {
  params: { courseId: string };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;

  // Fetch course data with all necessary information
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      professor: {
        select: {
          id: true,
          name: true,
          bio: true,
          expertise: true
        }
      },
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
          duration: true,
          bunnyVideoId: true
        }
      },
      _count: {
        select: {
          enrollments: true,
          lessons: true
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  // Format course data for components
  const formattedCourse = {
    ...course,
    price: course.price ? Number(course.price) : null,
    _count: course._count
  };

  // Calculate total duration (mock calculation)
  const totalDuration = course.lessons.reduce((total, lesson) => {
    return total + (lesson.duration || 0);
  }, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  const formatPrice = () => {
    if (!course.price || Number(course.price) === 0) {
      return 'مجاني';
    }
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(course.price));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Course Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                <Tag className="w-3 h-3 mr-1" />
                {course.category.name}
              </Badge>
              <Badge variant={course.isPublished ? "default" : "secondary"}>
                {course.isPublished ? "منشور" : "مسودة"}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Professor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                المدرس
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">{course.professor.name}</h3>
                {course.professor.bio && (
                  <p className="text-muted-foreground">{course.professor.bio}</p>
                )}
                {course.professor.expertise && course.professor.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {course.professor.expertise.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الدورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">السعر</span>
                <span className="font-semibold text-lg">{formatPrice()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  الدروس
                </span>
                <span className="font-semibold">{course._count.lessons}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  المدة
                </span>
                <span className="font-semibold">{formatDuration(totalDuration)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  الطلاب
                </span>
                <span className="font-semibold">{course._count.enrollments}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  تاريخ الإنشاء
                </span>
                <span className="font-semibold text-sm">
                  {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Course Rating (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                التقييم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.8</div>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  بناءً على {course._count.enrollments} تقييم
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Course Content with Access Control */}
      <CourseAccessGuard 
        courseId={courseId} 
        course={formattedCourse}
        showAccessInfo={true}
      >
        <CourseContent 
          course={formattedCourse}
          lessons={course.lessons}
        />
      </CourseAccessGuard>
    </div>
  );
}