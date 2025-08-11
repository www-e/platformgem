// src/components/analytics/admin/DetailedAnalyticsTabs.tsx

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  Award,
  PieChart,
} from 'lucide-react';
import { PlatformAnalytics } from '@/hooks/useAdminAnalytics';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';

interface DetailedAnalyticsTabsProps {
  analytics: PlatformAnalytics;
}

/**
 * Renders the main tab container for detailed analytics sections.
 * Note: In a future step, we will break down each <TabsContent> into its own component.
 */
export function DetailedAnalyticsTabs({ analytics }: DetailedAnalyticsTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        <TabsTrigger value="users">المستخدمون</TabsTrigger>
        <TabsTrigger value="courses">الدورات</TabsTrigger>
        <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
        <TabsTrigger value="activity">النشاط</TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4 pt-4">
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
                      <div className="text-sm font-semibold">{course.enrollments} ملتحق</div>
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
                      <div className="text-sm font-semibold">{professor.totalEnrollments} ملتحق</div>
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
      <TabsContent value="users" className="space-y-4 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">توزيع المستخدمين</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>الملتحقين</span>
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
      <TabsContent value="courses" className="space-y-4 pt-4">
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
      <TabsContent value="revenue" className="space-y-4 pt-4">
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
      <TabsContent value="activity" className="space-y-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              النشاط الحديث
            </CardTitle>
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
  );
}