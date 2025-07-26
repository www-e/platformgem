// src/components/analytics/ProfessorAnalytics.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  PlayCircle,
  CheckCircle,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface CourseAnalytics {
  course: {
    id: string;
    title: string;
  };
  overview: {
    totalStudents: number;
    totalLessons: number;
    totalDuration: number;
    overallCompletionRate: number;
    engagementRate: number;
    recentActivity: number;
  };
  students: Array<{
    student: {
      id: string;
      name: string;
      email: string;
    };
    enrolledAt: string;
    progressPercent: number;
    completedLessons: number;
    totalWatchTime: number;
    lastAccessedAt: string | null;
  }>;
  lessons: Array<{
    lesson: {
      id: string;
      title: string;
      order: number;
      duration: number | null;
    };
    completedCount: number;
    completionRate: number;
    totalWatchTime: number;
    averageWatchTime: number;
    viewCount: number;
  }>;
  metrics: {
    totalWatchTime: number;
    averageWatchTimePerStudent: number;
    completedLessonsCount: number;
    activeStudentsLast7Days: number;
  };
}

interface ProfessorAnalyticsProps {
  courseId: string;
}

export function ProfessorAnalytics({ courseId }: ProfessorAnalyticsProps) {
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/courses/${courseId}/analytics`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في تحميل الإحصائيات');
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchAnalytics();
    }
  }, [courseId]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  // Format date display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">خطأ في تحميل الإحصائيات</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'حدث خطأ أثناء تحميل بيانات الإحصائيات'}
          </p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{analytics.course.title}</h2>
          <p className="text-muted-foreground">إحصائيات مفصلة للدورة</p>
        </div>
        <Badge variant="outline" className="text-sm">
          آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.activeStudentsLast7Days} نشط خلال 7 أيام
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.overallCompletionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.metrics.completedLessonsCount} درس مكتمل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التفاعل</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.overview.engagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.recentActivity} نشاط حديث
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت المشاهدة</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(analytics.metrics.totalWatchTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatTime(analytics.metrics.averageWatchTimePerStudent)} متوسط لكل طالب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="lessons">الدروس</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                تقدم الطلاب
              </CardTitle>
              <CardDescription>
                تفاصيل تقدم كل طالب في الدورة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">لا يوجد طلاب مسجلون</h3>
                  <p className="text-muted-foreground">
                    لم يسجل أي طالب في هذه الدورة بعد
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.students.map((studentData) => (
                    <div key={studentData.student.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{studentData.student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {studentData.student.email}
                          </p>
                        </div>
                        <Badge variant={studentData.progressPercent >= 80 ? "default" : 
                                      studentData.progressPercent >= 50 ? "secondary" : "outline"}>
                          {studentData.progressPercent}% مكتمل
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            <span>تاريخ التسجيل</span>
                          </div>
                          <div className="font-medium">
                            {formatDate(studentData.enrolledAt)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>الدروس المكتملة</span>
                          </div>
                          <div className="font-medium">
                            {studentData.completedLessons} / {analytics.overview.totalLessons}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Clock className="w-3 h-3" />
                            <span>وقت المشاهدة</span>
                          </div>
                          <div className="font-medium">
                            {formatTime(studentData.totalWatchTime)}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <Eye className="w-3 h-3" />
                            <span>آخر دخول</span>
                          </div>
                          <div className="font-medium">
                            {studentData.lastAccessedAt 
                              ? formatDate(studentData.lastAccessedAt)
                              : 'لم يدخل بعد'
                            }
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${studentData.progressPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                أداء الدروس
              </CardTitle>
              <CardDescription>
                إحصائيات مفصلة لكل درس في الدورة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.lessons.map((lessonData) => (
                  <div key={lessonData.lesson.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {lessonData.lesson.order}. {lessonData.lesson.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          المدة: {formatTime(lessonData.lesson.duration || 0)}
                        </p>
                      </div>
                      <Badge variant={lessonData.completionRate >= 70 ? "default" : 
                                    lessonData.completionRate >= 40 ? "secondary" : "outline"}>
                        {lessonData.completionRate.toFixed(1)}% إكمال
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>أكمل الدرس</span>
                        </div>
                        <div className="font-medium">
                          {lessonData.completedCount} طالب
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <PlayCircle className="w-3 h-3" />
                          <span>عدد المشاهدات</span>
                        </div>
                        <div className="font-medium">
                          {lessonData.viewCount} مشاهدة
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          <span>إجمالي وقت المشاهدة</span>
                        </div>
                        <div className="font-medium">
                          {formatTime(lessonData.totalWatchTime)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>متوسط وقت المشاهدة</span>
                        </div>
                        <div className="font-medium">
                          {formatTime(lessonData.averageWatchTime)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Completion Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${lessonData.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  ملخص الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>إجمالي الدروس</span>
                  <Badge variant="outline">{analytics.overview.totalLessons}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>المدة الإجمالية</span>
                  <Badge variant="outline">{formatTime(analytics.overview.totalDuration)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>إجمالي الطلاب</span>
                  <Badge variant="outline">{analytics.overview.totalStudents}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>الطلاب النشطون</span>
                  <Badge variant="outline">{analytics.metrics.activeStudentsLast7Days}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  مؤشرات الأداء
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>معدل الإكمال العام</span>
                    <span className="font-semibold">
                      {analytics.overview.overallCompletionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analytics.overview.overallCompletionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>معدل التفاعل</span>
                    <span className="font-semibold">
                      {analytics.overview.engagementRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(analytics.overview.engagementRate, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground mb-1">
                    متوسط وقت المشاهدة لكل طالب
                  </div>
                  <div className="text-lg font-semibold">
                    {formatTime(analytics.metrics.averageWatchTimePerStudent)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}