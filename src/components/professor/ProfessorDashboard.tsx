// src/components/professor/ProfessorDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/shared/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Clock,
  Award,
  BarChart3,
  Plus,
  Calendar,
  Target,
  Star
} from 'lucide-react';
import { ProfessorOverview } from './ProfessorOverview';
import { StudentEnrollmentStats } from './StudentEnrollmentStats';
import { EarningsReport } from './EarningsReport';
import { CourseAnalytics } from './CourseAnalytics';
import { StudentEngagement } from './StudentEngagement';
import Link from 'next/link';

interface ProfessorStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalLessons: number;
  averageRating: number;
  completionRate: number;
  topCourse: {
    id: string;
    title: string;
    enrollments: number;
    revenue: number;
  } | null;
  recentEnrollments: Array<{
    id: string;
    studentName: string;
    courseName: string;
    enrolledAt: Date;
    progress: number;
  }>;
  monthlyGrowth: {
    students: number;
    revenue: number;
    courses: number;
  };
}

export function ProfessorDashboard() {
  const [stats, setStats] = useState<ProfessorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfessorStats();
  }, []);

  const fetchProfessorStats = async () => {
    try {
      const response = await fetch('/api/professor/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch professor stats:', error);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold">لوحة تحكم الأستاذ</h1>
          <p className="text-muted-foreground">
            إدارة شاملة لدوراتك وطلابك
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/professor/courses">
              <BookOpen className="h-4 w-4 mr-2" />
              إدارة الدورات
            </Link>
          </Button>
          <Button asChild>
            <Link href="/professor/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              دورة جديدة
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedCourses} منشورة / {stats.draftCourses} مسودة
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stats.monthlyGrowth.courses > 0 && (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    +{stats.monthlyGrowth.courses} هذا الشهر
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              طالب مسجل في دوراتك
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stats.monthlyGrowth.students > 0 && (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    +{stats.monthlyGrowth.students} هذا الشهر
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(stats.monthlyRevenue)} هذا الشهر
            </p>
            <div className="flex items-center gap-1 mt-1">
              {stats.monthlyGrowth.revenue > 0 && (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">
                    +{stats.monthlyGrowth.revenue}% نمو
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الإكمال</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              متوسط إكمال الطلاب
            </p>
            <div className="w-full bg-muted rounded-full h-1 mt-2">
              <div 
                className="bg-primary h-1 rounded-full" 
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدروس</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              درس منشور
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقييم العام</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              من 5 نجوم
            </p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${
                    i < Math.floor(stats.averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-muted-foreground'
                  }`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أفضل دورة</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.topCourse ? (
              <>
                <div className="text-sm font-medium truncate">{stats.topCourse.title}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.topCourse.enrollments} طالب
                </p>
                <p className="text-xs text-green-600 font-medium">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format(stats.topCourse.revenue)}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">لا توجد دورات بعد</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النشاط الحديث</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentEnrollments.length}</div>
            <p className="text-xs text-muted-foreground">
              تسجيل جديد اليوم
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="students">الطلاب</TabsTrigger>
          <TabsTrigger value="earnings">الإيرادات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="engagement">التفاعل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProfessorOverview stats={stats} />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentEnrollmentStats />
        </TabsContent>

        <TabsContent value="earnings" className="space-y-6">
          <EarningsReport />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <CourseAnalytics />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <StudentEngagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}