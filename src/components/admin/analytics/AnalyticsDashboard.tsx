// src/components/admin/analytics/AnalyticsDashboard.tsx - Comprehensive Analytics Dashboard
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InteractiveCharts } from "./InteractiveCharts";
import { FadeInScroll, StaggerChildren, StaggerItem } from "@/components/ui/micro-interactions";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock,
  Target,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    data: Array<{ name: string; value: number; date: string }>;
  };
  users: {
    total: number;
    growth: number;
    data: Array<{ name: string; value: number; date: string }>;
  };
  courses: {
    total: number;
    growth: number;
    data: Array<{ name: string; value: number; date: string }>;
  };
  categories: Array<{ name: string; value: number; color: string }>;
  kpis: {
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    churnRate: number;
  };
}

interface AnalyticsDashboardProps {
  onExport?: (type: 'csv' | 'excel' | 'pdf') => void;
  onDrillDown?: (category: string, data: any) => void;
}

export function AnalyticsDashboard({ onExport, onDrillDown }: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`);
        const data = await response.json();
        setAnalyticsData(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ar-EG').format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? 
      <ArrowUp className="w-4 h-4 text-green-600" /> : 
      <ArrowDown className="w-4 h-4 text-red-600" />;
  };

  const getTrendColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 bg-neutral-200 rounded w-24 animate-pulse" />
            <div className="h-8 bg-neutral-200 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-neutral-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
          لا توجد بيانات تحليلية
        </h3>
        <p className="text-neutral-600 font-primary">
          لم نتمكن من تحميل البيانات التحليلية
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeInScroll>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 font-display">
              لوحة التحليلات المتقدمة
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-neutral-600 font-primary">
                تحليل شامل لأداء المنصة
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Clock className="w-4 h-4" />
                <span className="font-primary">
                  آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex items-center border rounded-lg">
              {[
                { key: '7d', label: '7 أيام' },
                { key: '30d', label: '30 يوم' },
                { key: '90d', label: '90 يوم' },
                { key: '1y', label: 'سنة' }
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key as any)}
                  className="rounded-none first:rounded-r-md last:rounded-l-md"
                >
                  {period.label}
                </Button>
              ))}
            </div>

            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 ml-2" />
              تحديث
            </Button>

            <Button variant="outline" size="sm" onClick={() => onExport?.('excel')}>
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </div>
      </FadeInScroll>

      {/* KPI Cards */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StaggerItem>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-primary mb-1">
                      إجمالي الإيرادات
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 font-display">
                      {formatCurrency(analyticsData.revenue.total)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(analyticsData.revenue.growth)}
                      <span className={cn("text-sm font-primary", getTrendColor(analyticsData.revenue.growth))}>
                        {formatPercentage(Math.abs(analyticsData.revenue.growth))}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>

        <StaggerItem>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-primary mb-1">
                      المستخدمين النشطين
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 font-display">
                      {formatNumber(analyticsData.users.total)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(analyticsData.users.growth)}
                      <span className={cn("text-sm font-primary", getTrendColor(analyticsData.users.growth))}>
                        {formatPercentage(Math.abs(analyticsData.users.growth))}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>

        <StaggerItem>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-primary mb-1">
                      تسجيلات الدورات
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 font-display">
                      {formatNumber(analyticsData.courses.total)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {getTrendIcon(analyticsData.courses.growth)}
                      <span className={cn("text-sm font-primary", getTrendColor(analyticsData.courses.growth))}>
                        {formatPercentage(Math.abs(analyticsData.courses.growth))}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>

        <StaggerItem>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-primary mb-1">
                      معدل التحويل
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 font-display">
                      {formatPercentage(analyticsData.kpis.conversionRate)}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <Target className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-primary text-neutral-600">
                        من الزوار
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerItem>
      </StaggerChildren>

      {/* Interactive Charts */}
      <FadeInScroll>
        <InteractiveCharts
          revenueData={analyticsData.revenue.data}
          userGrowthData={analyticsData.users.data}
          courseEnrollmentData={analyticsData.courses.data}
          categoryDistribution={analyticsData.categories}
          onDrillDown={onDrillDown}
        />
      </FadeInScroll>

      {/* Advanced KPIs */}
      <FadeInScroll>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display">
              <Award className="w-5 h-5 text-primary-600" />
              مؤشرات الأداء المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600 font-display">
                  {formatCurrency(analyticsData.kpis.averageOrderValue)}
                </p>
                <p className="text-sm text-neutral-600 font-primary">متوسط قيمة الطلب</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600 font-display">
                  {formatCurrency(analyticsData.kpis.customerLifetimeValue)}
                </p>
                <p className="text-sm text-neutral-600 font-primary">قيمة العميل مدى الحياة</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-red-600 font-display">
                  {formatPercentage(analyticsData.kpis.churnRate)}
                </p>
                <p className="text-sm text-neutral-600 font-primary">معدل التسرب</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeInScroll>
    </div>
  );
}