// src/app/admin/professors/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernFilters, FilterOption, FilterValue } from "@/components/admin/ModernFilters";
import { CreateProfessorDialog } from "@/components/admin/CreateProfessorDialog";
import { 
  Users, 
  BookOpen, 
  Calendar,
  Phone,
  Mail,
  Eye,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Star,
  Award,
  Target
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

interface Professor {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  bio: string | null;
  expertise: string[];
  isActive: boolean;
  createdAt: string;
  stats: {
    totalRevenue: number;
    totalEnrollments: number;
    totalCertificates: number;
    completionRate: number;
    coursesCount: number;
  };
  ownedCourses: {
    id: string;
    title: string;
    _count: {
      enrollments: number;
      certificates: number;
    };
  }[];
}

const ITEMS_PER_PAGE = 12;

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
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
      key: 'hasCourses',
      label: 'الدورات',
      type: 'select',
      options: [
        { value: 'yes', label: 'لديه دورات' },
        { value: 'no', label: 'لا يوجد دورات' }
      ],
      placeholder: 'اختر حالة الدورات'
    },
    {
      key: 'revenueRange',
      label: 'نطاق الإيرادات',
      type: 'select',
      options: [
        { value: '0-1000', label: '0 - 1,000 جنيه' },
        { value: '1000-5000', label: '1,000 - 5,000 جنيه' },
        { value: '5000-10000', label: '5,000 - 10,000 جنيه' },
        { value: '10000+', label: 'أكثر من 10,000 جنيه' }
      ],
      placeholder: 'اختر نطاق الإيرادات'
    },
    {
      key: 'dateFrom',
      label: 'تاريخ الانضمام من',
      type: 'date',
      placeholder: 'اختر التاريخ'
    },
    {
      key: 'dateTo',
      label: 'تاريخ الانضمام إلى',
      type: 'date',
      placeholder: 'اختر التاريخ'
    }
  ];

  useEffect(() => {
    fetchProfessors();
  }, [currentPage, filters]);

  const fetchProfessors = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== "")
        )
      });

      const response = await fetch(`/api/admin/professors?${queryParams}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfessors(data.professors || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch professors:', error);
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

  const ProfessorCard = ({ professor, index }: { professor: Professor; index: number }) => (
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
                  {professor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{professor.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={professor.isActive ? "default" : "secondary"} className="text-xs">
                    {professor.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                  {index < 3 && (
                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                      <Star className="w-3 h-3 mr-1" />
                      متميز
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/professors/${professor.id}`} className="flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    عرض التفاصيل
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{professor.phone}</span>
            </div>
            
            {professor.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span dir="ltr">{professor.email}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>انضم في {formatAdminDate(new Date(professor.createdAt))}</span>
            </div>
          </div>

          {professor.bio && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {professor.bio}
            </p>
          )}

          {professor.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {professor.expertise.slice(0, 3).map((skill, skillIndex) => (
                <Badge key={skillIndex} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {professor.expertise.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professor.expertise.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{professor.stats.coursesCount}</div>
              <div className="text-xs text-muted-foreground">دورة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{professor.stats.totalEnrollments}</div>
              <div className="text-xs text-muted-foreground">طالب</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{professor.stats.totalCertificates}</div>
              <div className="text-xs text-muted-foreground">شهادة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{professor.stats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">إكمال</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP',
                  minimumFractionDigits: 0
                }).format(professor.stats.totalRevenue)}
              </div>
              <div className="text-xs text-muted-foreground">إجمالي الإيرادات</div>
            </div>
            
            {professor.ownedCourses.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {professor.ownedCourses.length} دورة منشورة
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const totalRevenue = professors.reduce((sum, p) => sum + p.stats.totalRevenue, 0);
  const totalEnrollments = professors.reduce((sum, p) => sum + p.stats.totalEnrollments, 0);
  const totalCourses = professors.reduce((sum, p) => sum + p.stats.coursesCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            إدارة الأساتذة
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة الأساتذة والمدرسين في المنصة
          </p>
        </div>
        <CreateProfessorDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأساتذة</p>
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
                <p className="text-sm text-muted-foreground">إجمالي الدورات</p>
                <p className="text-2xl font-bold text-green-600">{totalCourses}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الطلاب</p>
                <p className="text-2xl font-bold text-purple-600">{totalEnrollments}</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format(totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {professors.length > 0 && (
        <Card className="border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              أفضل الأساتذة أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {professors.slice(0, 3).map((professor, index) => (
                <div key={professor.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{professor.name}</h4>
                    <div className="text-sm text-muted-foreground">
                      {professor.stats.coursesCount} دورة • {professor.stats.totalEnrollments} طالب
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      {new Intl.NumberFormat('ar-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        minimumFractionDigits: 0
                      }).format(professor.stats.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <ModernFilters
        filters={filterOptions}
        values={filters}
        onChange={handleFiltersChange}
        onReset={handleResetFilters}
        showExport={true}
        isLoading={isLoading}
      />

      {/* Professors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-96 animate-pulse">
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
      ) : professors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professors.map((professor, index) => (
              <ProfessorCard key={professor.id} professor={professor} index={index} />
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
            <h3 className="text-lg font-semibold mb-2">لا يوجد أساتذة</h3>
            <p className="text-muted-foreground mb-6">
              {Object.keys(filters).length > 0 
                ? "لم يتم العثور على أساتذة مطابقين للفلاتر المحددة"
                : "لم يتم إضافة أي أساتذة بعد"
              }
            </p>
            <CreateProfessorDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}