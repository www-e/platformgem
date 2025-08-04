// src/components/student/StudentDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Award,
  Eye,
  Clock,
  Star,
  BarChart3,
  Calendar,
  Target,
  Zap,
  CreditCard,
  ShoppingCart,
  Heart
} from 'lucide-react';
import { EnrolledCourses } from './EnrolledCourses';
import { PaymentHistory } from './PaymentHistory';
import { RecommendedCourses } from './RecommendedCourses';
import { StudentProgress } from './StudentProgress';
import { StudentCertificates } from './StudentCertificates';

interface StudentStats {
  totalEnrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalWatchTime: number; // in minutes
  averageProgress: number;
  certificatesEarned: number;
  totalSpent: number;
  currentStreak: number;
  recentActivity: RecentActivity[];
  upcomingDeadlines: UpcomingDeadline[];
  achievements: Achievement[];
}

interface RecentActivity {
  id: string;
  type: 'lesson_complete' | 'course_enroll' | 'certificate_earned' | 'quiz_passed';
  courseName: string;
  lessonName?: string;
  timestamp: Date;
  progress?: number;
}

interface UpcomingDeadline {
  id: string;
  courseName: string;
  title: string;
  dueDate: Date;
  type: 'assignment' | 'quiz' | 'project';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'completion' | 'streak' | 'engagement' | 'excellence';
}

export function StudentDashboard() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const response = await fetch('/api/student/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch student stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  if (isLoading) {
    return (
      <LoadingState 
        cardCount={8} 
        gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      />
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل بيانات لوحة التحكم</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            لوحة تحكم الطالب
          </h1>
          <p className="text-muted-foreground">
            تتبع تقدمك وإنجازاتك التعليمية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الدورات المسجلة</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalEnrolledCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedCourses} مكتملة • {stats.inProgressCourses} قيد التقدم
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقدم</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageProgress.toFixed(1)}%</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.averageProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">وقت التعلم</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatWatchTime(stats.totalWatchTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              إجمالي وقت المشاهدة
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشهادات</CardTitle>
            <Award className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.certificatesEarned}</div>
            <p className="text-xs text-muted-foreground">
              شهادة مكتسبة
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(stats.totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              على الدورات المدفوعة
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">سلسلة التعلم</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              يوم متتالي من التعلم
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإنجازات</CardTitle>
            <Star className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">{stats.achievements.length}</div>
            <p className="text-xs text-muted-foreground">
              إنجاز مكتسب
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النشاط</CardTitle>
            <BarChart3 className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">85%</div>
            <p className="text-xs text-muted-foreground">
              نشاط أسبوعي
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="courses">دوراتي</TabsTrigger>
          <TabsTrigger value="progress">التقدم</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="recommended">مقترحة</TabsTrigger>
          <TabsTrigger value="certificates">الشهادات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  النشاط الحديث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {activity.type === 'lesson_complete' && <BookOpen className="h-5 w-5 text-green-600" />}
                        {activity.type === 'course_enroll' && <Users className="h-5 w-5 text-blue-600" />}
                        {activity.type === 'certificate_earned' && <Award className="h-5 w-5 text-yellow-600" />}
                        {activity.type === 'quiz_passed' && <Target className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {activity.type === 'lesson_complete' && `أكملت درس: ${activity.lessonName}`}
                          {activity.type === 'course_enroll' && `سجلت في دورة: ${activity.courseName}`}
                          {activity.type === 'certificate_earned' && `حصلت على شهادة: ${activity.courseName}`}
                          {activity.type === 'quiz_passed' && `نجحت في اختبار: ${activity.courseName}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      {activity.progress && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">{activity.progress}%</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  الإنجازات الحديثة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.achievements.slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {achievement.category === 'completion' && 'إكمال'}
                        {achievement.category === 'streak' && 'استمرارية'}
                        {achievement.category === 'engagement' && 'تفاعل'}
                        {achievement.category === 'excellence' && 'تميز'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <EnrolledCourses />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <StudentProgress />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <RecommendedCourses />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6">
          <StudentCertificates />
        </TabsContent>
      </Tabs>
    </div>
  );
}