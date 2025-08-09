// src/components/admin/SystemLogs.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModernFilters, FilterOption, FilterValue } from "@/components/admin/ModernFilters";
import { 
  Activity, 
  Users, 
  CreditCard, 
  BookOpen,
  Award,
  Server,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Calendar,
  Clock,
  User,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAdminDateTime, formatRelativeTime } from "@/lib/date-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LogEntry {
  id: string;
  type: 'USER' | 'PAYMENT' | 'COURSE' | 'ENROLLMENT' | 'CERTIFICATE' | 'SYSTEM';
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
}

interface LogStats {
  totalLogs: number;
  todayLogs: number;
  errorLogs: number;
  warningLogs: number;
  userActions: number;
  paymentActions: number;
  courseActions: number;
  systemActions: number;
}

const ITEMS_PER_PAGE = 20;

export function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterValue>({});
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const filterOptions: FilterOption[] = [
    {
      key: 'type',
      label: 'نوع السجل',
      type: 'select',
      options: [
        { value: 'USER', label: 'المستخدمين' },
        { value: 'PAYMENT', label: 'المدفوعات' },
        { value: 'COURSE', label: 'الدورات' },
        { value: 'ENROLLMENT', label: 'التسجيلات' },
        { value: 'CERTIFICATE', label: 'الشهادات' },
        { value: 'SYSTEM', label: 'النظام' }
      ],
      placeholder: 'اختر نوع السجل'
    },
    {
      key: 'severity',
      label: 'مستوى الأهمية',
      type: 'select',
      options: [
        { value: 'SUCCESS', label: 'نجح' },
        { value: 'INFO', label: 'معلومات' },
        { value: 'WARNING', label: 'تحذير' },
        { value: 'ERROR', label: 'خطأ' }
      ],
      placeholder: 'اختر مستوى الأهمية'
    },
    {
      key: 'dateFrom',
      label: 'من تاريخ',
      type: 'date',
      placeholder: 'اختر التاريخ'
    },
    {
      key: 'dateTo',
      label: 'إلى تاريخ',
      type: 'date',
      placeholder: 'اختر التاريخ'
    }
  ];

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
        )
      });

      const response = await fetch(`/api/admin/logs?${queryParams}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setLogs(data.data.logs || []);
        setTotalCount(data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/logs/stats');
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch log stats:', error);
    }
  };

  const handleFiltersChange = (newFilters: FilterValue) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
        )
      });

      const response = await fetch(`/api/admin/logs/export?${queryParams}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'INFO': return <Info className="w-4 h-4 text-blue-500" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'ERROR': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      SUCCESS: "bg-green-100 text-green-800 border-green-200",
      INFO: "bg-blue-100 text-blue-800 border-blue-200",
      WARNING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      ERROR: "bg-red-100 text-red-800 border-red-200"
    };
    
    const labels = {
      SUCCESS: "نجح",
      INFO: "معلومات",
      WARNING: "تحذير",
      ERROR: "خطأ"
    };

    return (
      <Badge className={cn("text-xs", variants[severity as keyof typeof variants])}>
        {labels[severity as keyof typeof labels] || severity}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'USER': return <Users className="w-4 h-4 text-blue-500" />;
      case 'PAYMENT': return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'COURSE': return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'ENROLLMENT': return <Users className="w-4 h-4 text-orange-500" />;
      case 'CERTIFICATE': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'SYSTEM': return <Server className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const LogEntryCard = ({ log, index }: { log: LogEntry; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-2 mt-1">
                {getSeverityIcon(log.severity)}
                {getTypeIcon(log.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-sm">{log.action}</h4>
                  {getSeverityBadge(log.severity)}
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {log.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(log.timestamp)}</span>
                  </div>
                  
                  {log.userName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{log.userName}</span>
                    </div>
                  )}
                  
                  {log.ipAddress && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>{log.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatAdminDateTime(log.timestamp)}
              </span>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      تفاصيل السجل
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">النوع</label>
                        <div className="flex items-center gap-2 mt-1">
                          {getTypeIcon(log.type)}
                          <span className="text-sm">{log.type}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">الأهمية</label>
                        <div className="mt-1">
                          {getSeverityBadge(log.severity)}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">الإجراء</label>
                      <p className="text-sm mt-1">{log.action}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">الوصف</label>
                      <p className="text-sm mt-1">{log.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">التوقيت</label>
                        <p className="text-sm mt-1">{formatAdminDateTime(log.timestamp)}</p>
                      </div>
                      {log.userName && (
                        <div>
                          <label className="text-sm font-medium">المستخدم</label>
                          <p className="text-sm mt-1">{log.userName}</p>
                        </div>
                      )}
                    </div>
                    
                    {log.ipAddress && (
                      <div>
                        <label className="text-sm font-medium">عنوان IP</label>
                        <p className="text-sm mt-1 font-mono">{log.ipAddress}</p>
                      </div>
                    )}
                    
                    {log.metadata && (
                      <div>
                        <label className="text-sm font-medium">بيانات إضافية</label>
                        <pre className="text-xs mt-1 p-3 bg-muted rounded-lg overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            سجل الأنشطة
          </h1>
          <p className="text-muted-foreground mt-1">
            مراقبة وتتبع جميع الأنشطة في النظام
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalLogs}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 bg-gradient-to-r from-green-500/10 to-green-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">سجلات اليوم</p>
                  <p className="text-2xl font-bold text-green-600">{stats.todayLogs}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">تحذيرات</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warningLogs}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-red-500/10 to-red-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">أخطاء</p>
                  <p className="text-2xl font-bold text-red-600">{stats.errorLogs}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <ModernFilters
        filters={filterOptions}
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
        showExport={false}
        isLoading={isLoading}
      />

      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : logs.length > 0 ? (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {logs.map((log, index) => (
                <LogEntryCard key={log.id} log={log} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="border-0 bg-card/50">
          <CardContent className="p-12 text-center">
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد سجلات</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0 
                ? "لم يتم العثور على سجلات مطابقة للفلاتر المحددة"
                : "لا توجد سجلات أنشطة حتى الآن"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}