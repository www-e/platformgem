// src/app/admin/students/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernFilters, FilterOption, FilterValue } from "@/components/admin/ModernFilters";
import { 
  Users, 
  BookOpen, 
  Calendar,
  Phone,
  Mail,
  Eye,
  MoreHorizontal,
  UserCheck,
  Clock,
  Award,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  studentId: string | null;
  isActive: boolean;
  createdAt: string;
  enrollments: {
    id: string;
    progressPercent: number;
    course: {
      id: string;
      title: string;
    };
  }[];
  certificates: {
    id: string;
    courseName: string;
    issuedAt: string;
  }[];
  _count: {
    enrollments: number;
    certificates: number;
  };
}

const ITEMS_PER_PAGE = 12;

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterValue>({});

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: 'active', label: 'نشط' },
        { value: 'inactive', label: 'غير نشط' }
      ],
      placeholder: 'اختر الحالة'
    },
    {
      key: 'hasEnrollments',
      label: 'التسجيلات',
      type: 'select',
      options: [
        { value: 'yes', label: 'لديه تسجيلات' },
        { value: 'no', label: 'لا يوجد تسجيلات' }
      ],
      placeholder: 'اختر حالة التسجيل'
    },
    {
      key: 'hasCertificates',
      label: 'الشهادات',
      type: 'select',
      options: [
        { value: 'yes', label: 'لديه شهادات' },
        { value: 'no', label: 'لا يوجد شهادات' }
      ],
      placeholder: 'اختر حالة الشهادات'
    },
    {
      key: 'dateFrom',
      label: 'تاريخ التسجيل من',
      type: 'date',
      placeholder: 'اختر التاريخ'
    },
    {
      key: 'dateTo',
      label: 'تاريخ التسجيل إلى',
      type: 'date',
      placeholder: 'اختر التاريخ'
    }
  ];

  useEffect(() => {
    fetchStudents();
  }, [currentPage, filters]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
        )
      });

      const response = await fetch(`/api/admin/students?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setStudents(data.students || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setIsLoading(false);
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const StudentCard = ({ student, index }: { student: Student; index: number }) => {
    const averageProgress = student.enrollments.length > 0 
      ? student.enrollments.reduce((sum, e) => sum + e.progressPercent, 0) / student.enrollments.length
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  {student.studentId && (
                    <p className="text-sm text-muted-foreground font-mono">
                      ID: {student.studentId}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={student.isActive ? "default" : "secondary"} className="text-xs">
                  {student.isActive ? "نشط" : "غير نشط"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/students/${student.id}`} className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        عرض التفاصيل
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{student.phone}</span>
              </div>
              
              {student.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span dir="ltr">{student.email}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>انضم في {formatAdminDate(new Date(student.createdAt))}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{student._count.enrollments}</div>
                <div className="text-xs text-muted-foreground">دورة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{student._count.certificates}</div>
                <div className="text-xs text-muted-foreground">شهادة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(averageProgress)}%</div>
                <div className="text-xs text-muted-foreground">التقدم</div>
              </div>
            </div>

            {student.enrollments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">الدورات الحالية</h4>
                <div className="space-y-2">
                  {student.enrollments.slice(0, 2).map((enrollment) => (
                    <div key={enrollment.id} className="flex justify-between items-center text-sm p-2 bg-background/50 rounded">
                      <span className="truncate">{enrollment.course.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {enrollment.progressPercent}%
                      </Badge>
                    </div>
                  ))}
                  {student.enrollments.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center">
                      و {student.enrollments.length - 2} دورة أخرى...
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            إدارة الطلاب
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة الطلاب المسجلين في المنصة
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-r from-green-500/10 to-green-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الطلاب النشطين</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.isActive).length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي التسجيلات</p>
                <p className="text-2xl font-bold text-purple-600">
                  {students.reduce((sum, s) => sum + s._count.enrollments, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الشهادات الممنوحة</p>
                <p className="text-2xl font-bold text-orange-600">
                  {students.reduce((sum, s) => sum + s._count.certificates, 0)}
                </p>
              </div>
              <Award className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ModernFilters
        filters={filterOptions}
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
        showExport={true}
        isLoading={isLoading}
      />

      {/* Students Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : students.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {students.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
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
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا يوجد طلاب</h3>
            <p className="text-muted-foreground">
              {Object.keys(filters).length > 0 
                ? "لم يتم العثور على طلاب مطابقين للفلاتر المحددة"
                : "لم يقم أي طالب بالتسجيل بعد"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}