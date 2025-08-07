// src/components/student/EnrolledCourses.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Play,
  Clock,
  Award,
  Eye,
  BarChart3,
  Calendar,
  CheckCircle,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  category: {
    name: string;
  };
  professor: {
    name: string;
  };
  enrolledAt: Date;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  totalDuration: number; // in minutes
  watchedDuration: number; // in minutes
  lastAccessedAt?: Date;
  nextLesson?: {
    id: string;
    title: string;
    order: number;
  };
  certificateEarned: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
}

export function EnrolledCourses() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/student/enrolled-courses');
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />مكتمل</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800"><PlayCircle className="h-3 w-3 mr-1" />قيد التقدم</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800"><BookOpen className="h-3 w-3 mr-1" />لم يبدأ</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    return 'اليوم';
  };

  const filteredCourses = courses.filter(course => {
    if (filter === 'all') return true;
    return course.status === filter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
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
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b">
        <Button
          variant={filter === 'all' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          جميع الدورات ({courses.length})
        </Button>
        <Button
          variant={filter === 'in_progress' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('in_progress')}
        >
          قيد التقدم ({courses.filter(c => c.status === 'in_progress').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          مكتملة ({courses.filter(c => c.status === 'completed').length})
        </Button>
        <Button
          variant={filter === 'not_started' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setFilter('not_started')}
        >
          لم تبدأ ({courses.filter(c => c.status === 'not_started').length})
        </Button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group hover:shadow-lg transition-all duration-300">
            {/* Course Header */}
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
              
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                {getStatusBadge(course.status)}
              </div>

              {/* Certificate Badge */}
              {course.certificateEarned && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Award className="h-3 w-3 mr-1" />
                    شهادة
                  </Badge>
                </div>
              )}

              {/* Progress Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{course.progress.toFixed(0)}% مكتمل</span>
                  <span>{course.completedLessons}/{course.totalLessons} دروس</span>
                </div>
                <Progress value={course.progress} className="h-1" />
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </CardTitle>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {course.category.name}
                </Badge>
                <span>•</span>
                <span>المدرس: {course.professor.name}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* Course Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(course.watchedDuration)} / {formatDuration(course.totalDuration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>سجلت {formatTimeAgo(course.enrolledAt)}</span>
                  </div>
                </div>

                {/* Last Activity */}
                {course.lastAccessedAt && (
                  <div className="text-sm text-muted-foreground">
                    آخر نشاط: {formatTimeAgo(course.lastAccessedAt)}
                  </div>
                )}

                {/* Next Lesson */}
                {course.nextLesson && course.status !== 'completed' && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-1">الدرس التالي:</p>
                    <p className="text-sm text-muted-foreground">{course.nextLesson.title}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/courses/${course.id}`}>
                      {course.status === 'not_started' ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          ابدأ الدورة
                        </>
                      ) : course.status === 'completed' ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          مراجعة الدورة
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          متابعة التعلم
                        </>
                      )}
                    </Link>
                  </Button>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/courses/${course.id}/analytics`}>
                      <BarChart3 className="h-4 w-4" />
                    </Link>
                  </Button>

                  {course.certificateEarned && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/certificates/${course.id}`}>
                        <Award className="h-4 w-4" />
                      </Link>
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
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {filter === 'all' ? 'لم تسجل في أي دورة بعد' : 
             filter === 'in_progress' ? 'لا توجد دورات قيد التقدم' :
             filter === 'completed' ? 'لم تكمل أي دورة بعد' :
             'لم تبدأ أي دورة بعد'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'all' ? 'ابدأ رحلتك التعليمية بالتسجيل في دورة جديدة' :
             'جرب تغيير المرشح لعرض دورات أخرى'}
          </p>
          {filter === 'all' && (
            <Button asChild>
              <Link href="/courses">
                <BookOpen className="h-4 w-4 mr-2" />
                تصفح الدورات
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}