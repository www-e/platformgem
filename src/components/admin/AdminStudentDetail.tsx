// src/components/admin/AdminStudentDetail.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  BookOpen,
  CreditCard,
  Award,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import PaymentDetailsModal from '@/components/payment/PaymentDetailsModal';

interface StudentDetailProps {
  student: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    studentId: string | null;
    isActive: boolean;
    createdAt: Date;
    enrollments: Array<{
      id: string;
      enrolledAt: Date;
      progressPercent: number;
      totalWatchTime: number;
      course: {
        id: string;
        title: string;
        thumbnailUrl: string;
        price: number | null;
        currency: string;
        professor: {
          name: string;
        };
      };
    }>;
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      createdAt: Date;
      completedAt: Date | null;
      failureReason: string | null;
      paymobTransactionId: number | null;
      course: {
        id: string;
        title: string;
        thumbnailUrl: string;
      };
    }>;
    certificates: Array<{
      id: string;
      certificateCode: string;
      issuedAt: Date;
      status: string;
      course: {
        title: string;
      };
    }>;
  };
}

export default function AdminStudentDetail({ student }: StudentDetailProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleDeleteStudent = async () => {
    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('تم حذف الطالب بنجاح');
        window.location.href = '/admin/students';
      } else {
        toast.error(result.error?.message || 'فشل في حذف الطالب');
      }
    } catch (error) {
      console.error('Delete student failed:', error);
      toast.error('حدث خطأ في حذف الطالب');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const response = await fetch(`/api/admin/users/${student.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !student.isActive
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`تم ${student.isActive ? 'إلغاء تفعيل' : 'تفعيل'} الطالب بنجاح`);
        window.location.reload();
      } else {
        toast.error(result.error?.message || 'فشل في تحديث حالة الطالب');
      }
    } catch (error) {
      console.error('Toggle status failed:', error);
      toast.error('حدث خطأ في تحديث الحالة');
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

  const handleViewPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setIsDetailsModalOpen(true);
  };

  // Calculate statistics
  const totalSpent = student.payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const completedPayments = student.payments.filter(p => p.status === 'COMPLETED').length;
  const failedPayments = student.payments.filter(p => p.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {student.name}
            {student.isActive ? (
              <Badge className="bg-green-100 text-green-800">نشط</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">غير نشط</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">
            معرف الطالب: {student.studentId || 'غير محدد'} | 
            تاريخ التسجيل: {new Date(student.createdAt).toLocaleDateString('ar-SA')}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              إجراءات
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleStatus}>
              {student.isActive ? (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  إلغاء التفعيل
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  تفعيل
                </>
              )}
            </DropdownMenuItem>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف الطالب
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف الطالب وجميع بياناته بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteStudent} className="bg-red-600 hover:bg-red-700">
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.enrollments.length}</div>
            <p className="text-xs text-muted-foreground">دورة مسجل بها</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإنفاق</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP',
                minimumFractionDigits: 0
              }).format(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">{completedPayments} دفعة مكتملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الشهادات</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.certificates.length}</div>
            <p className="text-xs text-muted-foreground">شهادة مكتسبة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {student.payments.length > 0 
                ? ((completedPayments / student.payments.length) * 100).toFixed(1) + '%'
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">في المدفوعات</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">{student.email || 'غير محدد'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">رقم الهاتف</p>
                <p className="text-sm text-muted-foreground" dir="ltr">{student.phone}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">تاريخ التسجيل</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(student.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">الدورات المسجل بها</TabsTrigger>
          <TabsTrigger value="payments">سجل المدفوعات</TabsTrigger>
          <TabsTrigger value="certificates">الشهادات</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الدورات المسجل بها ({student.enrollments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={enrollment.course.thumbnailUrl}
                      alt={enrollment.course.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{enrollment.course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        الأستاذ: {enrollment.course.professor.name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>التقدم: {enrollment.progressPercent}%</span>
                        <span>وقت المشاهدة: {Math.round(enrollment.totalWatchTime / 60)} دقيقة</span>
                        <span>تاريخ التسجيل: {new Date(enrollment.enrolledAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {enrollment.course.price ? (
                        <p className="font-semibold">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: enrollment.course.currency,
                            minimumFractionDigits: 0
                          }).format(enrollment.course.price)}
                        </p>
                      ) : (
                        <Badge variant="outline">مجاني</Badge>
                      )}
                    </div>
                  </div>
                ))}
                
                {student.enrollments.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لم يسجل في أي دورات بعد</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل المدفوعات ({student.payments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.payments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <img
                      src={payment.course.thumbnailUrl}
                      alt={payment.course.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{payment.course.title}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>تاريخ الإنشاء: {new Date(payment.createdAt).toLocaleDateString('ar-SA')}</span>
                        {payment.completedAt && (
                          <span>تاريخ الإكمال: {new Date(payment.completedAt).toLocaleDateString('ar-SA')}</span>
                        )}
                        {payment.paymobTransactionId && (
                          <span>رقم المعاملة: {payment.paymobTransactionId}</span>
                        )}
                      </div>

                      {payment.failureReason && (
                        <p className="text-xs text-red-600 mt-1">
                          سبب الفشل: {payment.failureReason}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-lg font-bold">
                        {new Intl.NumberFormat('ar-EG', {
                          style: 'currency',
                          currency: payment.currency,
                          minimumFractionDigits: 0
                        }).format(payment.amount)}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPaymentDetails(payment.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        التفاصيل
                      </Button>
                    </div>
                  </div>
                ))}
                
                {student.payments.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد مدفوعات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الشهادات ({student.certificates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.certificates.map((certificate) => (
                  <div key={certificate.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{certificate.course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        رمز الشهادة: {certificate.certificateCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        تاريخ الإصدار: {new Date(certificate.issuedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={certificate.status === 'ACTIVE' ? 'default' : 'secondary'}
                      >
                        {certificate.status === 'ACTIVE' ? 'نشطة' : 'غير نشطة'}
                      </Badge>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        عرض
                      </Button>
                    </div>
                  </div>
                ))}
                
                {student.certificates.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">لا توجد شهادات</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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