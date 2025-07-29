// src/components/admin/AdminPaymentManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  User,
  BookOpen,
  MoreHorizontal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  paymobOrderId?: string;
  paymobTransactionId?: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
    thumbnailUrl: string;
    professor: {
      name: string;
    };
  };
  lastWebhook?: {
    id: string;
    processedAt: string;
    processingAttempts: number;
    lastError?: string;
  };
}

interface PaymentSummary {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminPaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, statusFilter, searchTerm, dateFrom, dateTo]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/payments?${params}`);
      const result = await response.json();

      if (result.success) {
        setPayments(result.data.payments);
        setSummary(result.data.summary);
        setTotalPages(result.data.pagination.pages);
      } else {
        toast.error('فشل في تحميل المدفوعات');
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentAction = async (paymentId: string, action: string, additionalData?: any) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...additionalData
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم تحديث المدفوعة بنجاح');
        fetchPayments();
      } else {
        toast.error(result.error?.message || 'فشل في تحديث المدفوعة');
      }
    } catch (error) {
      console.error('Payment action failed:', error);
      toast.error('حدث خطأ في العملية');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />مكتمل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />معلق</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />فاشل</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const handleViewDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailsModalOpen(true);
  };

  const exportPayments = async () => {
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      });

      const response = await fetch(`/api/admin/payments/export?${params}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('تم تصدير البيانات بنجاح');
      } else {
        toast.error('فشل في تصدير البيانات');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('حدث خطأ في التصدير');
    }
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي المدفوعات</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
              <p className="text-xs text-muted-foreground">جميع المعاملات</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.completed}</div>
              <p className="text-xs text-muted-foreground">
                {summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : 0}% من المجموع
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معلقة</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
              <p className="text-xs text-muted-foreground">تحتاج متابعة</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">فاشلة</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <p className="text-xs text-muted-foreground">
                {summary.cancelled} ملغية
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP',
                  minimumFractionDigits: 0
                }).format(summary.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">من المدفوعات المكتملة</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            البحث والتصفية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="البحث بالطالب، الدورة، أو رقم المعاملة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="failed">فاشل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="من تاريخ"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="إلى تاريخ"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <div className="flex gap-2">
              <Button onClick={fetchPayments} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
              <Button onClick={exportPayments} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>المدفوعات ({summary?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={payment.course.thumbnailUrl}
                    alt={payment.course.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{payment.course.title}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{payment.user.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{payment.course.professor.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(payment.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>

                    {payment.paymobTransactionId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        رقم المعاملة: {payment.paymobTransactionId}
                      </p>
                    )}

                    {payment.failureReason && (
                      <p className="text-xs text-red-600 mt-1">
                        سبب الفشل: {payment.failureReason}
                      </p>
                    )}

                    {payment.lastWebhook?.lastError && (
                      <p className="text-xs text-orange-600 mt-1">
                        خطأ في المعالجة: {payment.lastWebhook.lastError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <div className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat('ar-EG', {
                      style: 'currency',
                      currency: payment.currency,
                      minimumFractionDigits: 0
                    }).format(payment.amount)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(payment.id)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      التفاصيل
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {payment.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handlePaymentAction(payment.id, 'manual_complete')}
                            >
                              <CheckCircle className="h-3 w-3 mr-2" />
                              إكمال يدوياً
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handlePaymentAction(payment.id, 'update_status', { 
                                status: 'failed', 
                                reason: 'Cancelled by admin' 
                              })}
                            >
                              <XCircle className="h-3 w-3 mr-2" />
                              إلغاء
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {payment.status === 'COMPLETED' && (
                          <DropdownMenuItem
                            onClick={() => handlePaymentAction(payment.id, 'retry_enrollment')}
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            إعادة محاولة التسجيل
                          </DropdownMenuItem>
                        )}

                        {payment.status === 'FAILED' && (
                          <DropdownMenuItem
                            onClick={() => handlePaymentAction(payment.id, 'manual_complete')}
                          >
                            <CheckCircle className="h-3 w-3 mr-2" />
                            إكمال يدوياً
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
            
            {payments.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد مدفوعات مطابقة للبحث</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                السابق
              </Button>
              
              <span className="text-sm text-muted-foreground">
                صفحة {currentPage} من {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        paymentId={selectedPaymentId}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPaymentId(null);
        }}
      />
    </div>
  );
}