// src/components/analytics/VideoAnalytics.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Users, 
  Clock, 
  TrendingUp, 
  Download,
  Eye,
  BarChart3,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoAnalyticsProps {
  lessonId: string;
  bunnyVideoId: string;
  bunnyLibraryId: string;
  className?: string;
}

interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  totalWatchTime: number;
  averageWatchTime: number;
  completionRate: number;
  dropOffPoints: { time: number; percentage: number }[];
  viewerEngagement: {
    date: string;
    views: number;
    watchTime: number;
  }[];
  topViewers: {
    userId: string;
    userName: string;
    watchTime: number;
    completionRate: number;
  }[];
}

export function VideoAnalytics({ 
  lessonId, 
  bunnyVideoId, 
  bunnyLibraryId,
  className 
}: VideoAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d

  useEffect(() => {
    fetchAnalytics();
  }, [lessonId, dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/lessons/${lessonId}/analytics?range=${dateRange}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('فشل في تحميل بيانات التحليلات');
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
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/lessons/${lessonId}/analytics/export?range=${dateRange}`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('فشل في تصدير البيانات');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lesson-analytics-${lessonId}-${dateRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('تم تصدير البيانات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تصدير البيانات');
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error || 'لا توجد بيانات متاحة'}</p>
            <Button 
              variant="outline" 
              onClick={fetchAnalytics}
              className="mt-4"
            >
              إعادة المحاولة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">تحليلات الفيديو</h3>
        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
          </select>
          
          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المشاهدون الفريدون</p>
                <p className="text-2xl font-bold">{analytics.uniqueViewers.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي وقت المشاهدة</p>
                <p className="text-2xl font-bold">{formatDuration(analytics.totalWatchTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">معدل الإكمال</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            مشاركة المشاهدين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>معدل الإكمال</span>
                <span>{analytics.completionRate.toFixed(1)}%</span>
              </div>
              <Progress value={analytics.completionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>متوسط وقت المشاهدة</span>
                <span>{formatDuration(analytics.averageWatchTime)}</span>
              </div>
              <Progress 
                value={(analytics.averageWatchTime / (analytics.totalWatchTime / analytics.uniqueViewers || 1)) * 100} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Viewers */}
      {analytics.topViewers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>أكثر المشاهدين نشاطاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topViewers.slice(0, 5).map((viewer, index) => (
                <div key={viewer.userId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{viewer.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        وقت المشاهدة: {formatDuration(viewer.watchTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{viewer.completionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">معدل الإكمال</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Drop-off Points */}
      {analytics.dropOffPoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>نقاط التوقف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.dropOffPoints.map((point, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">الدقيقة {Math.floor(point.time / 60)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(point.time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {point.percentage.toFixed(1)}% توقفوا
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}