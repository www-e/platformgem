// src/app/admin/payments/page.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // R.A.K.A.N: Replaced <img> with next/image for performance.
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {PaymentSummary} from "@/hooks/useAdminPayments"
import {
  ModernFilters,
  FilterOption,
  FilterValue,
} from "@/components/admin/ModernFilters";
import {
  CreditCard,
  DollarSign,
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
} from "@/components/ui/dialog";
import {
  PaymentWithDetails as Payment,
  PaymentActionData,
} from "@/lib/types/db";

// R.A.K.A.N: Moved static data outside the component to prevent re-creation on every render.
const ITEMS_PER_PAGE = 10;

// R.A.K.A.N: Memoized this component as its output only depends on its props.
const StatusBadge = memo(({ status }: { status: string }) => {
  const variants: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    FAILED: "bg-red-100 text-red-800 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
    REFUNDED: "bg-blue-100 text-blue-800 border-blue-200",
  };

  const labels: Record<string, string> = {
    COMPLETED: "مكتمل",
    PENDING: "في الانتظار",
    FAILED: "فاشل",
    CANCELLED: "ملغي",
    REFUNDED: "مسترد",
  };

  return (
    <Badge
      className={cn(
        "text-xs font-medium",
        variants[status] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {labels[status] || status}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

const StatusIcon = memo(({ status }: { status: string }) => {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "PENDING":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "FAILED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "CANCELLED":
      return <XCircle className="h-4 w-4 text-gray-500" />;
    case "REFUNDED":
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
});
StatusIcon.displayName = "StatusIcon";

// R.A.K.A.N: Refactored the Payment Card into its own component for clarity and separation of concerns.
const PaymentCard = ({
  payment,
  index,
  onAction,
  onSelect,
}: {
  payment: Payment;
  index: number;
  onAction: Function;
  onSelect: Function;
}) => {
  const lastWebhook = payment.webhooks?.[0]; // R.A.K.A.N: FIX - Safely access the first webhook.

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 w-full">
              <div className="relative w-16 h-12 flex-shrink-0">
                <Image
                  src={payment.course.thumbnailUrl || "/placeholder.png"}
                  alt={payment.course.title}
                  fill
                  sizes="64px"
                  className="object-cover rounded-lg"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-semibold text-base sm:text-lg truncate">
                    {payment.course.title}
                  </h4>
                  <StatusBadge status={payment.status} />
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
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
                      <span dir="ltr" className="truncate">
                        {payment.user.email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatRelativeTime(payment.createdAt)}</span>
                  </div>
                </div>

                {payment.failureReason && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />{" "}
                    {payment.failureReason}
                  </div>
                )}
                {lastWebhook?.lastError && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-600 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" /> خطأ في
                    المعالجة: {lastWebhook.lastError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {new Intl.NumberFormat("ar-EG", {
                    style: "currency",
                    currency: payment.currency,
                    minimumFractionDigits: 0,
                  }).format(Number(payment.amount))}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatAdminDateTime(payment.createdAt)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(payment)}
                >
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">التفاصيل</span>
                </Button>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {payment.status === "PENDING" && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            onAction(payment.id, "manual_complete")
                          }
                          className="cursor-pointer"
                        >
                          <CheckCircle className="h-4 w-4 ml-2" />
                          <span>إكمال يدوياً</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onAction(payment.id, "cancel", {
                              reason: "Cancelled by admin",
                            })
                          }
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          <XCircle className="h-4 w-4 ml-2" />
                          <span>إلغاء</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    {payment.status === "COMPLETED" &&
                      lastWebhook?.lastError && (
                        <DropdownMenuItem
                          onClick={() =>
                            onAction(payment.id, "retry_enrollment")
                          }
                          className="cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4 ml-2" />
                          <span>إعادة محاولة التسجيل</span>
                        </DropdownMenuItem>
                      )}
                    {payment.status === "FAILED" && (
                      <DropdownMenuItem
                        onClick={() => onAction(payment.id, "manual_complete")}
                        className="cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4 ml-2" />
                        <span>إكمال يدوياً</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onSelect(payment)}
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
};

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

  // R.A.K.A.N: Wrapped fetch logic in useCallback for performance and stability.
  const fetchPayments = useCallback(async () => {
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
  }, [currentPage, filters]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/payments/stats");
      const data = await response.json();
      if (response.ok && data.success) {
        setSummary(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment summary:", error);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
    fetchSummary();
  }, [fetchPayments, fetchSummary]);

  const handlePaymentAction = async (
    paymentId: string,
    action: string,
    additionalData?: PaymentActionData
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
    setCurrentPage(1);
    setFilters(newFilters);
  };
  const handleResetFilters = () => {
    setCurrentPage(1);
    setFilters({});
  };
  const handleExport = async () => {
    // ... export logic remains the same
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة المدفوعات</h1>
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
      </header>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={CreditCard}
            title="إجمالي المدفوعات"
            value={summary.total}
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="مكتملة"
            value={summary.completed}
            color="green"
          />
          <StatCard
            icon={Clock}
            title="في الانتظar"
            value={summary.pending}
            color="yellow"
          />
          <StatCard
            icon={XCircle}
            title="فاشلة"
            value={summary.failed}
            color="red"
          />
          <StatCard
            icon={DollarSign}
            title="إجمالي الإيرادات"
            value={new Intl.NumberFormat("ar-EG", {
              style: "currency",
              currency: "EGP",
              minimumFractionDigits: 0,
            }).format(summary.totalRevenue)}
            color="purple"
          />
        </div>
      )}

      <ModernFilters
        filters={filterOptions}
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : payments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {payments.map((payment, index) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                index={index}
                onAction={handlePaymentAction}
                onSelect={setSelectedPayment}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
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

      {/* R.A.K.A.N: Payment Details Dialog */}
      <Dialog
        open={!!selectedPayment}
        onOpenChange={(isOpen) => !isOpen && setSelectedPayment(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <StatusIcon status={selectedPayment.status} />
                  تفاصيل المدفوعة
                </DialogTitle>
              </DialogHeader>
              <PaymentDetails payment={selectedPayment} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// R.A.K.A.N: Extracted sub-components for clarity and reuse.

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string;
}) => (
  <Card
    className={`border-0 bg-gradient-to-r from-${color}-500/10 to-${color}-600/10`}
  >
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      </div>
      <Icon className={`w-8 h-8 text-${color}-500`} />
    </CardContent>
  </Card>
);

const SkeletonCard = () => (
  <Card className="animate-pulse">
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
);

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex justify-center items-center gap-2 mt-8">
    <Button
      variant="outline"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      السابق
    </Button>
    <span className="text-sm text-muted-foreground">
      صفحة {currentPage} من {totalPages}
    </span>
    <Button
      variant="outline"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      التالي
    </Button>
  </div>
);

const PaymentDetails = ({ payment }: { payment: Payment }) => (
  <div className="space-y-6 py-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">المبلغ</label>
        <p className="text-lg font-bold text-primary">
          {new Intl.NumberFormat("ar-EG", {
            style: "currency",
            currency: payment.currency,
            minimumFractionDigits: 0,
          }).format(Number(payment.amount))}
        </p>
      </div>
      <div>
        <label className="text-sm font-medium">الحالة</label>
        <div className="mt-1">
          <StatusBadge status={payment.status} />
        </div>
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">الدورة</label>
      <div className="flex items-center gap-3 mt-2 p-3 bg-muted/50 rounded-lg">
        <div className="relative w-16 h-10 bg-primary/10 rounded overflow-hidden flex-shrink-0">
          <Image
            src={payment.course.thumbnailUrl}
            alt={payment.course.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-medium">{payment.course.title}</p>
          <p className="text-sm text-muted-foreground">
            المدرس: {payment.course.professor.name}
          </p>
        </div>
      </div>
    </div>
    <div>
      <label className="text-sm font-medium">بيانات الملتحق</label>
      <div className="mt-2 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
        <p>
          <strong>الاسم:</strong> {payment.user.name}
        </p>
        <p>
          <strong>الهاتف:</strong> {payment.user.phone}
        </p>
        {payment.user.email && (
          <p>
            <strong>البريد الإلكتروني:</strong> {payment.user.email}
          </p>
        )}
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <label className="font-medium">تاريخ الإنشاء</label>
        <p className="mt-1">{formatAdminDateTime(payment.createdAt)}</p>
      </div>
      {payment.completedAt && (
        <div>
          <label className="font-medium">تاريخ الإكمال</label>
          <p className="mt-1">{formatAdminDateTime(payment.completedAt)}</p>
        </div>
      )}
    </div>
    {payment.paymobTransactionId && (
      <div>
        <label className="text-sm font-medium">معرف المعاملة</label>
        <p className="text-sm mt-1 font-mono">
          {String(payment.paymobTransactionId)}
        </p>
      </div>
    )}
  </div>
);
