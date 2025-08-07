// src/components/admin/analytics/InteractiveCharts.tsx - Enhanced Charts with Recharts
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Download,
  Maximize2,
  Filter,
  Users,
  DollarSign,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  users?: number;
  courses?: number;
  date?: string;
  growth?: number;
}

interface InteractiveChartsProps {
  revenueData: ChartData[];
  userGrowthData: ChartData[];
  courseEnrollmentData: ChartData[];
  categoryDistribution: ChartData[];
  onDrillDown?: (category: string, data: any) => void;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'];

export function InteractiveCharts({
  revenueData,
  userGrowthData,
  courseEnrollmentData,
  categoryDistribution,
  onDrillDown
}: InteractiveChartsProps) {
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'users' | 'courses' | 'categories'>('revenue');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-800 p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-neutral-900 dark:text-white font-display mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-primary text-neutral-600 dark:text-neutral-400">
                {entry.name}: 
              </span>
              <span className="font-semibold font-primary text-neutral-900 dark:text-white">
                {entry.name === 'الإيرادات' ? formatCurrency(entry.value) : formatNumber(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-neutral-600" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return "text-green-600 bg-green-100";
    if (growth < 0) return "text-red-600 bg-red-100";
    return "text-neutral-600 bg-neutral-100";
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={selectedChart === 'revenue' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('revenue')}
          >
            <DollarSign className="w-4 h-4 ml-2" />
            الإيرادات
          </Button>
          <Button
            variant={selectedChart === 'users' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('users')}
          >
            <Users className="w-4 h-4 ml-2" />
            المستخدمين
          </Button>
          <Button
            variant={selectedChart === 'courses' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('courses')}
          >
            <BookOpen className="w-4 h-4 ml-2" />
            الدورات
          </Button>
          <Button
            variant={selectedChart === 'categories' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedChart('categories')}
          >
            <PieChartIcon className="w-4 h-4 ml-2" />
            التصنيفات
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center border rounded-lg">
            {[
              { key: '7d', label: '7 أيام' },
              { key: '30d', label: '30 يوم' },
              { key: '90d', label: '90 يوم' },
              { key: '1y', label: 'سنة' }
            ].map((range) => (
              <Button
                key={range.key}
                variant={timeRange === range.key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range.key as any)}
                className="rounded-none first:rounded-r-md last:rounded-l-md"
              >
                {range.label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 ml-2" />
            فلترة
          </Button>

          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Chart Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedChart}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn("overflow-hidden", isFullscreen && "fixed inset-4 z-50")}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-display">
                  {selectedChart === 'revenue' && (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      تحليل الإيرادات
                    </>
                  )}
                  {selectedChart === 'users' && (
                    <>
                      <Users className="w-5 h-5 text-blue-600" />
                      نمو المستخدمين
                    </>
                  )}
                  {selectedChart === 'courses' && (
                    <>
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      تسجيلات الدورات
                    </>
                  )}
                  {selectedChart === 'categories' && (
                    <>
                      <PieChartIcon className="w-5 h-5 text-orange-600" />
                      توزيع التصنيفات
                    </>
                  )}
                </CardTitle>

                {/* Chart Metrics */}
                <div className="flex items-center gap-4">
                  {selectedChart === 'revenue' && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600 font-display">
                        {formatCurrency(revenueData.reduce((sum, item) => sum + item.value, 0))}
                      </p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(12.5)}
                        <span className="text-sm font-primary text-neutral-600">
                          +12.5% من الشهر الماضي
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedChart === 'users' && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600 font-display">
                        {formatNumber(userGrowthData.reduce((sum, item) => sum + item.value, 0))}
                      </p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(8.3)}
                        <span className="text-sm font-primary text-neutral-600">
                          +8.3% نمو شهري
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("h-80", isFullscreen && "h-96")}>
                <ResponsiveContainer width="100%" height="100%">
                  <>
                    {selectedChart === 'revenue' ? (
                      <ComposedChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickLine={{ stroke: '#e2e8f0' }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          fill="url(#revenueGradient)"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="الإيرادات"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    ) : selectedChart === 'users' ? (
                      <AreaChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickFormatter={formatNumber}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          fill="url(#userGradient)"
                          strokeWidth={2}
                          name="المستخدمين الجدد"
                        />
                        <defs>
                          <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    ) : selectedChart === 'courses' ? (
                      <BarChart data={courseEnrollmentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          tickFormatter={formatNumber}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="value" 
                          fill="#8b5cf6" 
                          radius={[4, 4, 0, 0]}
                          name="التسجيلات"
                        />
                      </BarChart>
                    ) : selectedChart === 'categories' ? (
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                          onClick={(data) => onDrillDown?.(data.name, data)}
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    ) : null}
                  </>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Chart Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-primary">أعلى نمو</p>
                <p className="font-semibold font-display">الدورات التقنية</p>
                <Badge className="text-xs mt-1 bg-green-100 text-green-800">
                  +24.5%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-primary">أكثر نشاطاً</p>
                <p className="font-semibold font-display">المستخدمين الجدد</p>
                <Badge className="text-xs mt-1 bg-blue-100 text-blue-800">
                  +18.2%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600 font-primary">أعلى إيراد</p>
                <p className="font-semibold font-display">دورات البرمجة</p>
                <Badge className="text-xs mt-1 bg-purple-100 text-purple-800">
                  {formatCurrency(45000)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}