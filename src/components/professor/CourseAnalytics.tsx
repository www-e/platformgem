// src/components/professor/CourseAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Target,
  Play,
  Award,
  MessageCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageProgress: number;
  totalWatchTime: number; // in minutes
  averageWatchTime: number;
  totalLessons: number;
  mostWatchedLesson: {
    id: string;
    title: string;
    watchTime: number;
    completionRate: number;
  } | null;
  leastWatchedLesson: {
    id: string;
    title: string;
    watchTime: number;
    completionRate: number;
  } | null;
  lessonAnalytics: Array<{
    id: string;
    title: string;
    order: number;
    duration: number;
    watchTime: number;
    completionRate: number;
    dropOffRate: number;
    averageEngagement: number;
  }>;
  studentEngagement: Array<{
    studentId: string;
    studentName: string;
    progress: number;
    watchTime: number;
    lastActivity: Date;
    engagementScore: number;
  }>;
  weeklyStats: Array<{
    week: string;
    enrollments: number;
    watchTime: number;
    completions: number;
  }>;
}

export function CourseAnalytics() {
  const [analytics, setAnalytics] = useState<CourseAnalytics[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourseAnalytics();
  }, []);

  const fetchCourseAnalytics = async () => {
    try {
      const response = await fetch('/api/professor/course-analytics');
      const data = await response.json();
      setAnalytics(data.analytics);
      if (data.analytics.length > 0) {
        setSelectedCourse(data.analytics[0].courseId);
      }
    } catch (error) {
      console.error('Failed to fetch course analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCourseData = analytics.find(course => course.courseId === selectedCourse);

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}س ${mins}د`;
    }
    return `${mins}د`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEngagementBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">ممتاز</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">جيد</Badge>;
    return <Badge className="bg-red-100 text-red-800">يحتاج تحسين</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
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

  if (analytics.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">لا توجد دورات لعرض التحليلات</p>
      </div>
    );
  }

  if (!selectedCourseData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">اختر دورة لعرض التحليلات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تحليلات الدورات</h2>
          <p className="text-muted-foreground">
            تحليل مفصل لأداء دوراتك وتفاعل الطلاب
          </p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="اختر دورة" />
          </SelectTrigger>
          <SelectContent>
            {analytics.map((course) => (
              <SelectItem key={course.courseId} value={course.courseId}>
                {course.courseName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Course Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCourseData.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {selectedCourseData.activeStudents} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCourseData.completionRate.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full" 
                style={{ width: `${selectedCourseData.completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي وقت المشاهدة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatWatchTime(selectedCourseData.totalWatchTime)}</div>
            <p className="text-xs text-muted-foreground">
              متوسط {formatWatchTime(selectedCourseData.averageWatchTime)} لكل طالب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedCourseData.averageProgress.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full" 
                style={{ width: `${selectedCourseData.averageProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesson Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              أداء الدروس
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedCourseData.lessonAnalytics.slice(0, 5).map((lesson) => (
                <div key={lesson.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{lesson.title}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {lesson.completionRate.toFixed(1)}% إكمال
                      </Badge>
                      {getEngagementBadge(lesson.averageEngagement)}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${lesson.completionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>وقت المشاهدة: {formatWatchTime(lesson.watchTime)}</span>
                    <span>معدل التسرب: {lesson.dropOffRate.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              تفاعل الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedCourseData.studentEngagement.slice(0, 5).map((student) => (
                <div key={student.studentId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{student.studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        آخر نشاط: {new Date(student.lastActivity).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{student.progress}%</Badge>
                      <span className={`text-sm font-medium ${getEngagementColor(student.engagementScore)}`}>
                        {student.engagementScore}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatWatchTime(student.watchTime)} مشاهدة
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best and Worst Performing Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              أفضل درس أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCourseData.mostWatchedLesson ? (
              <div className="space-y-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h3 className="font-semibold text-green-800 mb-2">
                    {selectedCourseData.mostWatchedLesson.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">وقت المشاهدة</p>
                      <p className="font-medium">
                        {formatWatchTime(selectedCourseData.mostWatchedLesson.watchTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">معدل الإكمال</p>
                      <p className="font-medium">
                        {selectedCourseData.mostWatchedLesson.completionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>💡 هذا الدرس يحقق أفضل تفاعل من الطلاب. فكر في تطبيق نفس الأسلوب في دروس أخرى.</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-red-600" />
              درس يحتاج تحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCourseData.leastWatchedLesson ? (
              <div className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h3 className="font-semibold text-red-800 mb-2">
                    {selectedCourseData.leastWatchedLesson.title}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">وقت المشاهدة</p>
                      <p className="font-medium">
                        {formatWatchTime(selectedCourseData.leastWatchedLesson.watchTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">معدل الإكمال</p>
                      <p className="font-medium">
                        {selectedCourseData.leastWatchedLesson.completionRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>⚠️ هذا الدرس يحتاج إلى مراجعة. فكر في تحسين المحتوى أو طريقة العرض.</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">لا توجد بيانات كافية</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            الأداء الأسبوعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedCourseData.weeklyStats.map((week) => (
              <div key={week.week} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{week.week}</span>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{week.enrollments} تسجيل</span>
                    <span>{formatWatchTime(week.watchTime)} مشاهدة</span>
                    <span>{week.completions} إكمال</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">التسجيلات</div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full" 
                        style={{ 
                          width: `${Math.min((week.enrollments / Math.max(...selectedCourseData.weeklyStats.map(w => w.enrollments))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">المشاهدة</div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full" 
                        style={{ 
                          width: `${Math.min((week.watchTime / Math.max(...selectedCourseData.weeklyStats.map(w => w.watchTime))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">الإكمال</div>
                    <div className="w-full bg-muted rounded-full h-1">
                      <div 
                        className="bg-purple-500 h-1 rounded-full" 
                        style={{ 
                          width: `${Math.min((week.completions / Math.max(...selectedCourseData.weeklyStats.map(w => w.completions))) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}