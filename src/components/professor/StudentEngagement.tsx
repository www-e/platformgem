// src/components/professor/StudentEngagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity,
  Clock,
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  Eye,
  PlayCircle,
  BookOpen,
  Award,
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EngagementData {
  totalActiveStudents: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
  studentActivities: StudentActivity[];
  courseEngagement: CourseEngagement[];
  weeklyEngagement: WeeklyEngagement[];
  topEngagedStudents: TopStudent[];
  recentInteractions: RecentInteraction[];
}

interface StudentActivity {
  id: string;
  studentName: string;
  courseName: string;
  activityType: 'video_watch' | 'lesson_complete' | 'quiz_attempt' | 'comment';
  duration?: number; // for video_watch
  timestamp: Date;
  progress: number;
}

interface CourseEngagement {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageWatchTime: number;
  completionRate: number;
  engagementScore: number;
}

interface WeeklyEngagement {
  week: string;
  activeStudents: number;
  totalWatchTime: number;
  completedLessons: number;
  engagementScore: number;
}

interface TopStudent {
  id: string;
  name: string;
  totalWatchTime: number;
  completedCourses: number;
  averageProgress: number;
  lastActivity: Date;
  engagementScore: number;
}

interface RecentInteraction {
  id: string;
  studentName: string;
  courseName: string;
  type: 'question' | 'comment' | 'completion' | 'milestone';
  content: string;
  timestamp: Date;
  needsResponse: boolean;
}

export function StudentEngagement() {
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchEngagementData();
  }, [selectedCourse, selectedPeriod]);

  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/professor/student-engagement?course=${selectedCourse}&period=${selectedPeriod}`);
      const data = await response.json();
      setEngagementData(data);
    } catch (error) {
      console.error('Failed to fetch engagement data:', error);
    } finally {
      setIsLoading(false);
    }
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
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
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

  if (!engagementData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل بيانات التفاعل</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            تفاعل الطلاب
          </h2>
          <p className="text-muted-foreground">
            تتبع نشاط وتفاعل طلابك مع المحتوى
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={(value: 'week' | 'month' | 'quarter') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنة</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الدورة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الدورات</SelectItem>
              {engagementData.courseEngagement.map((course) => (
                <SelectItem key={course.courseId} value={course.courseId}>
                  {course.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلاب النشطون</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{engagementData.totalActiveStudents}</div>
            <p className="text-xs text-muted-foreground">
              من إجمالي الطلاب المسجلين
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت المشاهدة</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatDuration(engagementData.averageWatchTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              لكل طالب يومياً
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {engagementData.completionRate.toFixed(1)}%
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${engagementData.completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نقاط التفاعل</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEngagementColor(engagementData.engagementScore)}`}>
              {engagementData.engagementScore.toFixed(0)}
            </div>
            {getEngagementBadge(engagementData.engagementScore)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              تفاعل الدورات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.courseEngagement.map((course) => (
                <div key={course.courseId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold truncate">{course.courseName}</h4>
                    {getEngagementBadge(course.engagementScore)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{course.activeStudents}/{course.totalStudents} نشط</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-muted-foreground" />
                      <span>{course.averageProgress.toFixed(0)}% تقدم</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDuration(course.averageWatchTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-3 w-3 text-muted-foreground" />
                      <span>{course.completionRate.toFixed(0)}% إكمال</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${course.averageProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Engaged Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              أكثر الطلاب تفاعلاً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagementData.topEngagedStudents.map((student, index) => (
                <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(student.totalWatchTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {student.completedCourses} دورة
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-16 bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${student.averageProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {student.averageProgress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getEngagementColor(student.engagementScore)}`}>
                      {student.engagementScore.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(student.lastActivity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Student Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            النشاطات الحديثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {engagementData.studentActivities.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {activity.activityType === 'video_watch' && <PlayCircle className="h-5 w-5 text-blue-600" />}
                  {activity.activityType === 'lesson_complete' && <Award className="h-5 w-5 text-green-600" />}
                  {activity.activityType === 'quiz_attempt' && <Target className="h-5 w-5 text-purple-600" />}
                  {activity.activityType === 'comment' && <MessageSquare className="h-5 w-5 text-orange-600" />}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium">{activity.studentName}</p>
                  <p className="text-sm text-muted-foreground">{activity.courseName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {activity.activityType === 'video_watch' && `شاهد ${formatDuration(activity.duration || 0)}`}
                      {activity.activityType === 'lesson_complete' && 'أكمل الدرس'}
                      {activity.activityType === 'quiz_attempt' && 'حاول الاختبار'}
                      {activity.activityType === 'comment' && 'أضاف تعليق'}
                    </span>
                    <div className="w-16 bg-muted rounded-full h-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ width: `${activity.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.progress}%
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            التفاعلات الحديثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {engagementData.recentInteractions.map((interaction) => (
              <div key={interaction.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  interaction.needsResponse ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <MessageSquare className={`h-5 w-5 ${
                    interaction.needsResponse ? 'text-red-600' : 'text-green-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{interaction.studentName}</p>
                    <Badge variant={interaction.needsResponse ? 'destructive' : 'secondary'} className="text-xs">
                      {interaction.type === 'question' && 'سؤال'}
                      {interaction.type === 'comment' && 'تعليق'}
                      {interaction.type === 'completion' && 'إكمال'}
                      {interaction.type === 'milestone' && 'إنجاز'}
                    </Badge>
                    {interaction.needsResponse && (
                      <Badge variant="outline" className="text-xs text-red-600">
                        يحتاج رد
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">{interaction.courseName}</p>
                  <p className="text-sm">{interaction.content}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-2">
                    {formatTimeAgo(interaction.timestamp)}
                  </p>
                  {interaction.needsResponse && (
                    <Button size="sm" variant="outline">
                      رد
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}