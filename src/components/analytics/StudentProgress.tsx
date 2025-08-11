// src/components/analytics/StudentProgress.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface StudentProgressData {
  student: {
    id: string;
    name: string;
    email: string;
  };
  enrollment: {
    id: string;
    progressPercent: number;
    enrolledAt: string;
    lastAccessedAt: string | null;
    totalWatchTime: number;
    completedLessonIds: string[];
  };
  course: {
    id: string;
    title: string;
    totalLessons: number;
    totalDuration: number;
  };
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    duration: number | null;
    completed: boolean;
    watchedDuration: number;
    lastPosition: number;
    completionPercent: number;
  }>;
  achievements: {
    completionRate: number;
    watchTimeRank: number;
    totalStudents: number;
    streakDays: number;
    certificateEligible: boolean;
  };
}

interface StudentProgressProps {
  studentId: string;
  courseId: string;
}

export function StudentProgress({ studentId, courseId }: StudentProgressProps) {
  const [progressData, setProgressData] = useState<StudentProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student progress data
  useEffect(() => {
    async function fetchProgressData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/students/${studentId}/progress?courseId=${courseId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'فشل في تحميل بيانات التقدم');
        }

        const data = await response.json();
        setProgressData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (studentId && courseId) {
      fetchProgressData();
    }
  }, [studentId, courseId]);

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
        <Card>
          <CardHeader className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-muted-foreground mb-4">
            {error || 'حدث خطأ أثناء تحميل بيانات تقدم الملتحق'}
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
      {/* Student Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{progressData.student.name}</CardTitle>
              <CardDescription className="text-base">
                {progressData.student.email} • {progressData.course.title}
              </CardDescription>
            </div>
            <Badge 
              variant={progressData.enrollment.progressPercent >= 80 ? "default" : 
                      progressData.enrollment.progressPercent >= 50 ? "secondary" : "outline"}
              className="text-lg px-3 py-1"
            >
              {progressData.enrollment.progressPercent}% مكتمل
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>التقدم الإجمالي</span>
                <span>
                  {progressData.enrollment.completedLessonIds.length} من {progressData.course.totalLessons} دروس
                </span>
              </div>
              <Progress value={progressData.enrollment.progressPercent} className="h-3" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">تاريخ التسجيل</span>
                </div>
                <div className="font-semibold">
                  {formatDate(progressData.enrollment.enrolledAt)}
                </div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">وقت المشاهدة</span>
                </div>
                <div className="font-semibold">
                  {formatTime(progressData.enrollment.totalWatchTime)}
                </div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">آخر دخول</span>
                </div>
                <div className="font-semibold">
                  {progressData.enrollment.lastAccessedAt 
                    ? formatDate(progressData.enrollment.lastAccessedAt)
                    : 'لم يدخل بعد'
                  }
                </div>
              </div>

              <div className="text-center p-3 border rounded-lg">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">الترتيب</span>
                </div>
                <div className="font-semibold">
                  {progressData.achievements.watchTimeRank} من {progressData.achievements.totalStudents}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            الإنجازات والشارات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                progressData.achievements.completionRate >= 80 ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
              }`}>
                <Target className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">معدل الإكمال العالي</h4>
              <p className="text-sm text-muted-foreground">
                {progressData.achievements.completionRate >= 80 ? 'تم الحصول عليها' : 'لم يتم الحصول عليها بعد'}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                {progressData.achievements.completionRate.toFixed(1)}% / 80%
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                progressData.achievements.streakDays >= 7 ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">المتابعة المستمرة</h4>
              <p className="text-sm text-muted-foreground">
                {progressData.achievements.streakDays >= 7 ? 'تم الحصول عليها' : 'لم يتم الحصول عليها بعد'}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                {progressData.achievements.streakDays} أيام / 7 أيام
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                progressData.achievements.certificateEligible ? 'bg-purple-100 text-purple-600' : 'bg-muted text-muted-foreground'
              }`}>
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-semibold mb-1">مؤهل للشهادة</h4>
              <p className="text-sm text-muted-foreground">
                {progressData.achievements.certificateEligible ? 'مؤهل للحصول على الشهادة' : 'غير مؤهل بعد'}
              </p>
              <div className="text-xs text-muted-foreground mt-1">
                يتطلب إكمال 90% من الدورة
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            تقدم الدروس
          </CardTitle>
          <CardDescription>
            تفاصيل تقدم الملتحق في كل درس
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.lessons.map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      lesson.completed 
                        ? 'bg-green-100 text-green-600' 
                        : lesson.watchedDuration > 0
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {lesson.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : lesson.watchedDuration > 0 ? (
                        <PlayCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{lesson.order}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{lesson.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        المدة: {formatTime(lesson.duration || 0)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={lesson.completed ? "default" : lesson.watchedDuration > 0 ? "secondary" : "outline"}>
                    {lesson.completed ? 'مكتمل' : lesson.watchedDuration > 0 ? 'جاري' : 'لم يبدأ'}
                  </Badge>
                </div>

                {/* Lesson Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>التقدم في الدرس</span>
                    <span>{lesson.completionPercent.toFixed(1)}%</span>
                  </div>
                  <Progress value={lesson.completionPercent} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>تم المشاهدة: {formatTime(lesson.watchedDuration)}</span>
                    {lesson.lastPosition > 0 && (
                      <span>آخر موضع: {formatTime(lesson.lastPosition)}</span>
                    )}
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