// src/components/admin/RevenueAnalytics.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  CreditCard,
  Users,
  BookOpen,
  BarChart3
} from 'lucide-react';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  topCourses: TopCourse[];
  recentPayments: Payment[];
  monthlyData: MonthlyRevenue[];
  paymentMethods: PaymentMethodStats[];
}

interface TopCourse {
  id: string;
  title: string;
  revenue: number;
  enrollments: number;
  professor: string;
}

interface Payment {
  id: string;
  amount: number;
  courseName: string;
  studentName: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  enrollments: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export function RevenueAnalytics() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchRevenueData();
  }, [selectedPeriod]);

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`/api/admin/revenue-analytics?period=${selectedPeriod}`);
      const data = await response.json();
      setRevenueData(data);
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/admin/export-revenue-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ period: selectedPeriod }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
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

  if (!revenueData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">فشل في تحميل بيانات الإيرادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تحليل الإيرادات</h2>
          <p className="text-muted-foreground">
            تتبع الأداء المالي للمنصة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              أسبوع
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              شهر
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPeriod('year')}
            >
              سنة
            </Button>
          </div>
          <Button onClick={exportReport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              }).format(revenueData.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {revenueData.revenueGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={`text-xs ${revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(revenueData.revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات الشهر</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(revenueData.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إيرادات اليوم</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(revenueData.dailyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ar-SA')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الطلب</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueData.recentPayments.length > 0 
                ? new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format(
                    revenueData.recentPayments.reduce((sum, p) => sum + p.amount, 0) / 
                    revenueData.recentPayments.length
                  )
                : '0 ج.م'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              قيمة الطلب الواحد
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Courses by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              أعلى الدورات إيراداً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium truncate">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {course.professor} • {course.enrollments} تسجيل
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(course.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              طرق الدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.paymentMethods.map((method) => (
                <div key={method.method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{method.method}</span>
                    <span className="text-sm text-muted-foreground">
                      {method.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{method.count} معاملة</span>
                    <span>
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(method.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            المدفوعات الحديثة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {revenueData.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-sm text-muted-foreground">{payment.courseName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">
                    {new Intl.NumberFormat('ar-EG', {
                      style: 'currency',
                      currency: 'EGP'
                    }).format(payment.amount)}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={payment.status === 'completed' ? 'default' : 
                               payment.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {payment.status === 'completed' && 'مكتمل'}
                      {payment.status === 'pending' && 'معلق'}
                      {payment.status === 'failed' && 'فشل'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(payment.timestamp).toLocaleDateString('ar-SA')}
                    </span>
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