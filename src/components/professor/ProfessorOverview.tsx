// src/components/professor/ProfessorOverview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign,
  Clock,
  Star,
  Award,
  Eye,
  Calendar,
  ArrowUpRight,
  Activity,
  Target
} from 'lucide-react';

interface ProfessorOverviewProps {
  stats: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalStudents: number;
    totalEarnings: number;
    monthlyEarnings: number;
    averageRating: number;
    totalViews: number;
    completionRate: number;
    recentEnrollments: RecentEnrollment[];
    topCourses: TopCourse[];
    monthlyStats: MonthlyStats[];
  };
}

interface RecentEnrollment {
  id: string;
  studentName: string;
  courseName: string;
  enrolledAt: Date;
  progress: number;
}

interface TopCourse {
  id: string;
  title: string;
  students: number;
  earnings: number;
  rating: number;
  completionRate: number;
}

interface MonthlyStats {
  month: string;
  earnings: number;
  students: number;
  courses: number;
}

export function ProfessorOverview({ stats }: ProfessorOverviewProps) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Performance Metrics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Key Performance Indicators */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Target className="h-5 w-5" />
              مؤشرات الأداء الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {((stats.totalStudents / stats.totalCourses) || 0).toFixed(0)}
                </div>
                <p className="text-sm font-medium text-blue-800">متوسط الطلاب لكل دورة</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.totalStudents > 50 ? 'أداء ممتاز!' : 'يمكن تحسينه'}
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format((stats.totalEarnings / stats.totalCourses) || 0)}
                </div>
                <p className="text-sm font-medium text-green-800">متوسط الربح لكل دورة</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.totalEarnings > 1000 ? 'ربحية عالية!' : 'فرصة للنمو'}
                </p>
              </div>

              <div className="text-center p-4 bg-white rounded-lg border border-purple-100">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.completionRate.toFixed(0)}%
                </div>
                <p className="text-sm font-medium text-purple-800">معدل إكمال الدورات</p>
                <p className="text-xs text-purple-600 mt-1">
                  {stats.completionRate > 70 ? 'محتوى ممتاز!' : 'يحتاج تحسين'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              الأداء الشهري
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.monthlyStats.map((month, index) => (
                <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.students} طالب جديد • {month.courses} دورة
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(month.earnings)}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      {index > 0 && month.earnings > stats.monthlyStats[index - 1].earnings ? (
                        <>
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">نمو</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">مستقر</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Top Performing Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              أفضل الدورات أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCourses.slice(0, 3).map((course, index) => (
                <div key={course.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{course.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{course.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-green-600">
                        {new Intl.NumberFormat('ar-EG', {
                          style: 'currency',
                          currency: 'EGP',
                          minimumFractionDigits: 0
                        }).format(course.earnings)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {course.completionRate.toFixed(0)}% إكمال
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              التسجيلات الحديثة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEnrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{enrollment.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{enrollment.courseName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {enrollment.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(enrollment.enrolledAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                إنشاء دورة جديدة
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                مراجعة التقييمات
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                تقرير الأرباح
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                رسائل الطلاب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}