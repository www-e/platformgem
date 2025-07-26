// src/components/analytics/AdminAnalytics.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  Award,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface PlatformAnalytics {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    activeUsers: number;
    publishedCourses: number;
  };
  userStats: {
    students: number;
    professors: number;
    admins: number;
    newUsersThisMonth: number;
    activeUsersThisWeek: number;
  };
  courseStats: {
    totalLessons: number;
    totalWatchTime: number;
    averageCompletionRate: number;
    topCategories: Array<{
      name: string;
      courseCount: number;
      enrollmentCount: number;
    }>;
  };
  revenueStats: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageOrderValue: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
  };
  topCourses: Array<{
    id: string;
    title: string;
    professor: string;
    enrollments: number;
    revenue: number;
    completionRate: number;
  }>;
  topProfessors: Array<{
    id: string;
    name: string;
    coursesCount: number;
    totalEnrollments: number;
    totalRevenue: number;
  }>;
  recentActivity: Array<{
    type: 'enrollment' | 'payment' | 'course_created' | 'lesson_completed';
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
        
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

    fetchAnalytics();
  }, [timeRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ساعة ${minutes} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إحصائيات المنصة</h2>
          <p className="text-muted-foreground">نظرة شاملة على أداء المنصة</p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeUsers} نشط
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.publishedCourses} منشورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.courseStats.averageCompletionRate.toFixed(1)}% معدل الإكمال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenueStats.monthlyRevenue)} هذا الشهر
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="courses">الدورات</TabsTrigger>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  أفضل الدورات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topCourses.slice(0, 5).map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{course.title}</h4>
                          <p className="text-xs text-muted-foreground">{course.professor}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{course.enrollments} طالب</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(course.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Professors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  أفضل الأساتذة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topProfessors.slice(0, 5).map((professor, index) => (
                    <div key={professor.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <h4 className="font-medium text-sm">{professor.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            {professor.coursesCount} دورة
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{professor.totalEnrollments} طالب</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(professor.totalRevenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">توزيع المستخدمين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>الطلاب</span>
                  <Badge variant="outline">{analytics.userStats.students}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>الأساتذة</span>
                  <Badge variant="outline">{analytics.userStats.professors}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>المديرون</span>
                  <Badge variant="outline">{analytics.userStats.admins}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">النشاط الحديث</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>مستخدمون جدد هذا الشهر</span>
                  <Badge variant="default">{analytics.userStats.newUsersThisMonth}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>نشطون هذا الأسبوع</span>
                  <Badge variant="secondary">{analytics.userStats.activeUsersThisWeek}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معدل النمو</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{Math.round((analytics.userStats.newUsersThisMonth / analytics.overview.totalUsers) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">نمو المستخدمين</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  إحصائيات المحتوى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>إجمالي الدروس</span>
                  <Badge variant="outline">{analytics.courseStats.totalLessons}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>وقت المشاهدة الإجمالي</span>
                  <Badge variant="outline">{formatTime(analytics.courseStats.totalWatchTime)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>معدل الإكمال</span>
                  <Badge variant="default">
                    {analytics.courseStats.averageCompletionRate.toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  أفضل الفئات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.courseStats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">{category.courseCount} دورة</div>
                        <div className="text-xs text-muted-foreground">
                          {category.enrollmentCount} تسجيل
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات الدفع</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>دفعات ناجحة</span>
                  <Badge variant="default">{analytics.revenueStats.successfulPayments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>دفعات معلقة</span>
                  <Badge variant="secondary">{analytics.revenueStats.pendingPayments}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>دفعات فاشلة</span>
                  <Badge variant="outline">{analytics.revenueStats.failedPayments}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">متوسط قيمة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics.revenueStats.averageOrderValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">متوسط قيمة الشراء</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الإيرادات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(analytics.revenueStats.monthlyRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">إيرادات هذا الشهر</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                النشاط الحديث
              </CardTitle>
              <CardDescription>
                آخر الأنشطة على المنصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'enrollment' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                      activity.type === 'course_created' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {activity.type === 'enrollment' && <Users className="w-4 h-4" />}
                      {activity.type === 'payment' && <DollarSign className="w-4 h-4" />}
                      {activity.type === 'course_created' && <BookOpen className="w-4 h-4" />}
                      {activity.type === 'lesson_completed' && <Award className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}