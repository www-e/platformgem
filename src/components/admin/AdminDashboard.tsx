// src/components/admin/AdminDashboard.tsx - Enterprise Admin Dashboard
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { LoadingState } from '@/components/shared/LoadingState';
import { FadeInScroll, StaggerChildren, StaggerItem } from '@/components/ui/micro-interactions';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  UserCheck,
  Settings,
  Bell,
  Download,
  RefreshCw,
  Grid3X3,
  BarChart3,
  Moon,
  Sun,
  Minimize2,
  Filter,
  AlertTriangle,
  Clock,
  Zap,
  Shield,
  Database,
  Server,
  Wifi,
  HardDrive
} from 'lucide-react';
import { PlatformOverview } from './PlatformOverview';
import { RevenueAnalytics } from './RevenueAnalytics';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { CategoryManagement } from './CategoryManagement';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalProfessors: number;
  totalCourses: number;
  totalCategories: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalEnrollments: number;
  activeCourses: number;
  certificatesIssued: number;
  recentActivity: ActivityItem[];
  systemHealth: SystemHealth;
  realTimeMetrics: RealTimeMetrics;
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'payment' | 'course_created' | 'certificate_issued';
  description: string;
  timestamp: Date;
  user?: string;
  amount?: number;
}

interface SystemHealth {
  database: { status: 'healthy' | 'warning' | 'error'; responseTime: number };
  server: { status: 'healthy' | 'warning' | 'error'; cpuUsage: number; memoryUsage: number };
  storage: { status: 'healthy' | 'warning' | 'error'; usedSpace: number; totalSpace: number };
  network: { status: 'healthy' | 'warning' | 'error'; latency: number };
}

interface RealTimeMetrics {
  activeUsers: number;
  ongoingLessons: number;
  recentSignups: number;
  pendingPayments: number;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'activity' | 'health';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Real-time data fetching
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // WebSocket connection for real-time updates
  useEffect(() => {
    fetchDashboardStats();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    
    // WebSocket connection for real-time notifications
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'dashboard_update') {
        setStats(prev => prev ? { ...prev, ...data.payload } : null);
        setLastUpdate(new Date());
      } else if (data.type === 'notification') {
        setNotifications(prev => [data.payload, ...prev.slice(0, 9)]);
      }
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [fetchDashboardStats]);

  // Initialize widgets layout
  useEffect(() => {
    const defaultWidgets: DashboardWidget[] = [
      { id: 'users', title: 'المستخدمين', type: 'stat', size: 'small', position: { x: 0, y: 0 }, visible: true },
      { id: 'courses', title: 'الدورات', type: 'stat', size: 'small', position: { x: 1, y: 0 }, visible: true },
      { id: 'revenue', title: 'الإيرادات', type: 'stat', size: 'small', position: { x: 2, y: 0 }, visible: true },
      { id: 'activity', title: 'النشاط الحديث', type: 'activity', size: 'large', position: { x: 0, y: 1 }, visible: true },
      { id: 'health', title: 'حالة النظام', type: 'health', size: 'medium', position: { x: 2, y: 1 }, visible: true }
    ];
    setWidgets(defaultWidgets);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchDashboardStats();
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };



  if (isLoading) {
    return (
      <div className={cn("min-h-screen transition-colors duration-300", isDarkMode && "dark bg-neutral-900")}>
        <LoadingState 
          cardCount={8} 
          gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn("min-h-screen transition-colors duration-300", isDarkMode && "dark bg-neutral-900")}>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-black font-display mb-2">
            خطأ في تحميل البيانات
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 font-primary mb-4">
            فشل في تحميل بيانات لوحة التحكم
          </p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 ml-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDarkMode && "dark bg-neutral-900")}>
      <div className="space-y-6 p-6">
        {/* Enhanced Header */}
        <FadeInScroll>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-black font-display">
                لوحة التحكم الإدارية
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-neutral-600 dark:text-neutral-400 font-primary">
                  إدارة شاملة للمنصة التعليمية
                </p>
                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-primary">متصل</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Real-time Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-primary text-neutral-700 dark:text-neutral-300">
                  آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
                <Moon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>

              {/* Dashboard Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsCustomizing(!isCustomizing)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </FadeInScroll>

        {/* Widget Customization Panel */}
        <AnimatePresence>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-900 dark:text-black font-display">
                  تخصيص الويدجت
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(false)}>
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {widgets.map((widget) => (
                  <div key={widget.id} className="flex items-center gap-2">
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                    <span className="text-sm font-primary text-neutral-700 dark:text-neutral-300">
                      {widget.title}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Real-time Metrics Bar */}
        <FadeInScroll>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-black border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-primary">المستخدمين النشطين</p>
                    <p className="text-2xl font-bold font-display">
                      {stats.realTimeMetrics?.activeUsers || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-black border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-primary">دروس جارية</p>
                    <p className="text-2xl font-bold font-display">
                      {stats.realTimeMetrics?.ongoingLessons || 0}
                    </p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-black border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-primary">تسجيلات حديثة</p>
                    <p className="text-2xl font-bold font-display">
                      {stats.realTimeMetrics?.recentSignups || 0}
                    </p>
                  </div>
                  <UserCheck className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-black border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-primary">مدفوعات معلقة</p>
                    <p className="text-2xl font-bold font-display">
                      {stats.realTimeMetrics?.pendingPayments || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeInScroll>

        {/* Main Stats Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {widgets.filter(w => w.visible && w.type === 'stat').map((widget) => (
            <StaggerItem key={widget.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200 dark:bg-neutral-800 dark:border-neutral-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-primary">
                      {widget.id === 'users' && 'إجمالي المستخدمين'}
                      {widget.id === 'courses' && 'إجمالي الدورات'}
                      {widget.id === 'revenue' && 'إجمالي الإيرادات'}
                    </CardTitle>
                    {widget.id === 'users' && <Users className="h-4 w-4 text-neutral-500" />}
                    {widget.id === 'courses' && <BookOpen className="h-4 w-4 text-neutral-500" />}
                    {widget.id === 'revenue' && <DollarSign className="h-4 w-4 text-neutral-500" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-neutral-900 dark:text-black font-display">
                      {widget.id === 'users' && stats.totalUsers}
                      {widget.id === 'courses' && stats.totalCourses}
                      {widget.id === 'revenue' && new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(stats.totalRevenue)}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary mt-1">
                      {widget.id === 'users' && `${stats.totalStudents} طالب • ${stats.totalProfessors} مدرس`}
                      {widget.id === 'courses' && `${stats.activeCourses} دورة نشطة`}
                      {widget.id === 'revenue' && `${new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(stats.monthlyRevenue)} هذا الشهر`}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}

          {/* Additional Stats */}
          <StaggerItem>
            <Card className="hover:shadow-lg transition-all duration-200 dark:bg-neutral-800 dark:border-neutral-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-400 font-primary">
                  التسجيلات
                </CardTitle>
                <UserCheck className="h-4 w-4 text-neutral-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-neutral-900 dark:text-black font-display">
                  {stats.totalEnrollments}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary mt-1">
                  إجمالي التسجيلات في الدورات
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerChildren>

        {/* System Health Dashboard */}
        {widgets.find(w => w.id === 'health' && w.visible) && (
          <FadeInScroll>
            <Card className="dark:bg-neutral-800 dark:border-neutral-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-900 dark:text-black font-display">
                  <Shield className="w-5 h-5 text-green-600" />
                  حالة النظام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Database Health */}
                  <div className="p-4 border rounded-lg dark:border-neutral-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900 dark:text-black font-primary">
                          قاعدة البيانات
                        </span>
                      </div>
                      <Badge className={getStatusColor(stats.systemHealth?.database.status || 'healthy')}>
                        {stats.systemHealth?.database.status === 'healthy' ? 'سليم' : 
                         stats.systemHealth?.database.status === 'warning' ? 'تحذير' : 'خطأ'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary">
                      زمن الاستجابة: {stats.systemHealth?.database.responseTime || 0}ms
                    </p>
                  </div>

                  {/* Server Health */}
                  <div className="p-4 border rounded-lg dark:border-neutral-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900 dark:text-black font-primary">
                          الخادم
                        </span>
                      </div>
                      <Badge className={getStatusColor(stats.systemHealth?.server.status || 'healthy')}>
                        {stats.systemHealth?.server.status === 'healthy' ? 'سليم' : 
                         stats.systemHealth?.server.status === 'warning' ? 'تحذير' : 'خطأ'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary">
                      CPU: {stats.systemHealth?.server.cpuUsage || 0}% • RAM: {stats.systemHealth?.server.memoryUsage || 0}%
                    </p>
                  </div>

                  {/* Storage Health */}
                  <div className="p-4 border rounded-lg dark:border-neutral-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900 dark:text-black font-primary">
                          التخزين
                        </span>
                      </div>
                      <Badge className={getStatusColor(stats.systemHealth?.storage.status || 'healthy')}>
                        {stats.systemHealth?.storage.status === 'healthy' ? 'سليم' : 
                         stats.systemHealth?.storage.status === 'warning' ? 'تحذير' : 'خطأ'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary">
                      المستخدم: {((stats.systemHealth?.storage.usedSpace || 0) / (stats.systemHealth?.storage.totalSpace || 1) * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Network Health */}
                  <div className="p-4 border rounded-lg dark:border-neutral-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-900 dark:text-black font-primary">
                          الشبكة
                        </span>
                      </div>
                      <Badge className={getStatusColor(stats.systemHealth?.network.status || 'healthy')}>
                        {stats.systemHealth?.network.status === 'healthy' ? 'سليم' : 
                         stats.systemHealth?.network.status === 'warning' ? 'تحذير' : 'خطأ'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-primary">
                      زمن الاستجابة: {stats.systemHealth?.network.latency || 0}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FadeInScroll>
        )}

        {/* Enhanced Main Content Tabs */}
        <FadeInScroll>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="grid grid-cols-5 w-fit bg-neutral-100 dark:bg-neutral-800">
                <TabsTrigger value="overview" className="font-primary">نظرة عامة</TabsTrigger>
                <TabsTrigger value="users" className="font-primary">المستخدمين</TabsTrigger>
                <TabsTrigger value="courses" className="font-primary">الدورات</TabsTrigger>
                <TabsTrigger value="categories" className="font-primary">التصنيفات</TabsTrigger>
                <TabsTrigger value="revenue" className="font-primary">الإيرادات</TabsTrigger>
              </TabsList>

              {/* Tab-specific Actions */}
              <div className="flex items-center gap-2">
                {activeTab === 'overview' && (
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 ml-2" />
                    تقرير شامل
                  </Button>
                )}
                {activeTab === 'users' && (
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 ml-2" />
                    فلترة متقدمة
                  </Button>
                )}
                {activeTab === 'revenue' && (
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير البيانات
                  </Button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="overview" className="space-y-6">
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PlatformOverview stats={stats} />
                </motion.div>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <UserManagement />
                </motion.div>
              </TabsContent>

              <TabsContent value="courses" className="space-y-6">
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CourseManagement />
                </motion.div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CategoryManagement categories={[]} />
                </motion.div>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-6">
                <motion.div
                  key="revenue"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RevenueAnalytics />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </FadeInScroll>

        {/* Floating Action Button for Quick Actions */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 300 }}
        >
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Grid3X3 className="w-6 h-6" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}