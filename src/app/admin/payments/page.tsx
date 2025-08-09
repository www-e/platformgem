// src/app/admin/payments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ModernFilters,
  FilterOption,
  FilterValue,
} from "@/components/admin/ModernFilters";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Download,
  Users,
  Calendar,
  Phone,
  Mail,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAdminDateTime, formatRelativeTime } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  paymobOrderId?: string;
  paymobTransactionId?: number;
  user: {
    id: string;
    name: string;
    email?: string;
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

const ITEMS_PER_PAGE = 12;

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterValue>({});
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const filterOptions: FilterOption[] = [
    {
      key: "status",
      label: "حالة الدفع",
      type: "select",
      options: [
        { value: "PENDING", label: "في الانتظار" },
        { value: "COMPLETED", label: "مكتمل" },
        { value: "FAILED", label: "فاشل" },
        { value: "CANCELLED", label: "ملغي" },
        { value: "REFUNDED", label: "مسترد" },
      ],
      placeholder: "اختر حالة الدفع",
    },
    {
      key: "amountRange",
      label: "نطاق المبلغ",
      type: "select",
      options: [
        { value: "0-100", label: "0 - 100 جنيه" },
        { value: "100-500", label: "100 - 500 جنيه" },
        { value: "500-1000", label: "500 - 1,000 جنيه" },
        { value: "1000+", label: "أكثر من 1,000 جنيه" },
      ],
      placeholder: "اختر نطاق المبلغ",
    },
    {
      key: "dateFrom",
      label: "من تاريخ",
      type: "date",
      placeholder: "اختر التاريخ",
    },
    {
      key: "dateTo",
      label: "إلى تاريخ",
      type: "date",
      placeholder: "اختر التاريخ",
    },
  ];

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [currentPage, filters]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) => value !== undefined && value !== ""
          )
        ),
      });

      const response = await fetch(`/api/admin/payments?${queryParams}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPayments(data.data.payments || []);
        setTotalCount(data.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/admin/payments/stats");
      const data = await response.json();

      if (response.ok && data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment summary:", error);
    }
  };

  const handlePaymentAction = async (
    paymentId: string,
    action: string,
    additionalData?: any
  ) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...additionalData }),
      });

      const result = await response.json();

      if (result.success) {
        fetchPayments();
        fetchSummary();
      }
    } catch (error) {
      console.error("Payment action failed:", error);
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
          Object.entries(filters).filter(
            ([_, value]) => value !== undefined && value !== ""
          )
        ),
      });

      const response = await fetch(`/api/admin/payments/export?${queryParams}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case "REFUNDED":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
      REFUNDED: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const labels = {
      COMPLETED: "مكتمل",
      PENDING: "في الانتظار",
      FAILED: "فاشل",
      CANCELLED: "ملغي",
      REFUNDED: "مسترد",
    };

    return (
      <Badge
        className={cn("text-xs", variants[status as keyof typeof variants])}
      >
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const PaymentCard = ({
    payment,
    index,
  }: {
    payment: Payment;
    index: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                {payment.course.thumbnailUrl ? (
                  <img
                    src={payment.course.thumbnailUrl}
                    alt={payment.course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <CreditCard className="w-6 h-6 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-lg truncate">
                    {payment.course.title}
                  </h4>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{payment.user.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{payment.user.phone}</span>
                  </div>

                  {payment.user.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span dir="ltr">{payment.user.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatRelativeTime(payment.createdAt)}</span>
                  </div>
                </div>

                {payment.failureReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-600">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      {payment.failureReason}
                    </p>
                  </div>
                )}

                {payment.lastWebhook?.lastError && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-600">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      خطأ في المعالجة: {payment.lastWebhook.lastError}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("ar-EG", {
                    style: "currency",
                    currency: payment.currency,
                    minimumFractionDigits: 0,
                  }).format(payment.amount)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatAdminDateTime(payment.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      التفاصيل
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        تفاصيل المدفوعة
                      </DialogTitle>
                    </DialogHeader>

                    {selectedPayment && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              المبلغ
                            </label>
                            <p className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat("ar-EG", {
                                style: "currency",
                                currency: selectedPayment.currency,
                                minimumFractionDigits: 0,
                              }).format(selectedPayment.amount)}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              الحالة
                            </label>
                            <div className="mt-1">
                              {getStatusBadge(selectedPayment.status)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">الدورة</label>
                          <div className="flex items-center gap-3 mt-2 p-3 bg-muted/50 rounded-lg">
                            <div className="w-12 h-8 bg-primary/10 rounded overflow-hidden">
                              {selectedPayment.course.thumbnailUrl && (
                                <img
                                  src={selectedPayment.course.thumbnailUrl}
                                  alt={selectedPayment.course.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {selectedPayment.course.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                المدرس: {selectedPayment.course.professor.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            بيانات الطالب
                          </label>
                          <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2">
                            <p>
                              <strong>الاسم:</strong>{" "}
                              {selectedPayment.user.name}
                            </p>
                            <p>
                              <strong>الهاتف:</strong>{" "}
                              {selectedPayment.user.phone}
                            </p>
                            {selectedPayment.user.email && (
                              <p>
                                <strong>البريد الإلكتروني:</strong>{" "}
                                {selectedPayment.user.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              تاريخ الإنشاء
                            </label>
                            <p className="text-sm mt-1">
                              {formatAdminDateTime(selectedPayment.createdAt)}
                            </p>
                          </div>
                          {selectedPayment.completedAt && (
                            <div>
                              <label className="text-sm font-medium">
                                تاريخ الإكمال
                              </label>
                              <p className="text-sm mt-1">
                                {formatAdminDateTime(
                                  selectedPayment.completedAt
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {selectedPayment.paymobTransactionId && (
                          <div>
                            <label className="text-sm font-medium">
                              معرف المعاملة
                            </label>
                            <p className="text-sm mt-1 font-mono">
                              {selectedPayment.paymobTransactionId}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-background/95 backdrop-blur-sm border shadow-lg"
                    sideOffset={5}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {payment.status === "PENDING" && (
                      <>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handlePaymentAction(payment.id, "manual_complete");
                          }}
                          className="cursor-pointer"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          <span>إكمال يدوياً</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePaymentAction(payment.id, "cancel", {
                              reason: "Cancelled by admin",
                            });
                          }}
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          <span>إلغاء</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {payment.status === "COMPLETED" &&
                      payment.lastWebhook?.lastError && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handlePaymentAction(payment.id, "retry_enrollment");
                          }}
                          className="cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4 ml-2" />
                          <span>إعادة محاولة التسجيل</span>
                        </DropdownMenuItem>
                      )}
                    {payment.status === "FAILED" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.preventDefault();
                          handlePaymentAction(payment.id, "manual_complete");
                        }}
                        className="cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        <span>إكمال يدوياً</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedPayment(payment);
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 ml-2" />
                      <span>عرض التفاصيل</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
            إدارة المدفوعات
          </h1>
          <p className="text-muted-foreground mt-1">
            مراقبة وإدارة جميع المدفوعات والمعاملات في النظام
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchPayments}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")}
            />
            تحديث
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    إجمالي المدفوعات
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summary.total}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-green-500/10 to-green-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summary.completed}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {summary.pending}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-red-500/10 to-red-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">فاشلة</p>
                  <p className="text-2xl font-bold text-red-600">
                    {summary.failed}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    إجمالي الإيرادات
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Intl.NumberFormat("ar-EG", {
                      style: "currency",
                      currency: "EGP",
                      minimumFractionDigits: 0,
                    }).format(summary.totalRevenue)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
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

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-12 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                  <div className="w-24 h-8 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : payments.length > 0 ? (
        <>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <PaymentCard key={payment.id} payment={payment} index={index} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
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
            <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد مدفوعات</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0
                ? "لم يتم العثور على مدفوعات مطابقة للفلاتر المحددة"
                : "لا توجد مدفوعات في النظام حتى الآن"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
