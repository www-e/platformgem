// src/app/admin/courses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback} from "@/components/ui/avatar";
import Image from 'next/image';
import {
  ModernFilters,
  FilterOption,
  FilterValue,
} from "@/components/admin/ModernFilters";
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Star,
} from "lucide-react";
import Link from "next/link";
import { formatAdminDate } from "@/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  isPublished: boolean;
  thumbnailUrl: string;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  professor: { id: string; name: string };
  _count: {
    enrollments: number;
    lessons: number;
  };
  revenue?: number;
}

const ITEMS_PER_PAGE = 12;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [professors, setProfessors] = useState<{ id: string; name: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FilterValue>({});

  const filterOptions: FilterOption[] = [
    {
      key: "category",
      label: "التصنيف",
      type: "select",
      options: categories.map((cat) => ({ value: cat.id, label: cat.name })),
      placeholder: "اختر التصنيف",
    },
    {
      key: "professor",
      label: "المدرس",
      type: "select",
      options: professors.map((prof) => ({ value: prof.id, label: prof.name })),
      placeholder: "اختر المدرس",
    },
    {
      key: "status",
      label: "الحالة",
      type: "select",
      options: [
        { value: "published", label: "منشورة" },
        { value: "draft", label: "مسودة" },
      ],
      placeholder: "اختر الحالة",
    },
    {
      key: "priceType",
      label: "نوع السعر",
      type: "select",
      options: [
        { value: "free", label: "مجانية" },
        { value: "paid", label: "مدفوعة" },
      ],
      placeholder: "اختر نوع السعر",
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
    fetchData();
    fetchCategories();
    fetchProfessors();
  }, [currentPage, filters]);

  const fetchData = async () => {
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

      const response = await fetch(`/api/admin/courses?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await fetch("/api/users?role=PROFESSOR");
      const data = await response.json();
      setProfessors(data.data?.users || []);
    } catch (error) {
      console.error("Failed to fetch professors:", error);
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

  const CourseCard = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            {course.thumbnailUrl ? (
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-full object-cover"
                width={300}
                height={300}
              />
            ) : (
              <BookOpen className="w-12 h-12 text-primary/40" />
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge
              variant={course.isPublished ? "default" : "secondary"}
              className="text-xs"
            >
              {course.isPublished ? "منشورة" : "مسودة"}
            </Badge>
            {course.price === null && (
              <Badge
                variant="outline"
                className="text-xs bg-green-50 text-green-700 border-green-200"
              >
                مجانية
              </Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    عرض التفاصيل
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {course.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {course.professor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {course.professor.name}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{course._count.enrollments}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{course._count.lessons}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatAdminDate(new Date(course.createdAt))}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Badge variant="outline" className="text-xs">
                {course.category.name}
              </Badge>
              <div className="text-right">
                {course.price !== null ? (
                  <div className="font-semibold text-primary">
                    {new Intl.NumberFormat("ar-EG", {
                      style: "currency",
                      currency: course.currency,
                      minimumFractionDigits: 0,
                    }).format(course.price)}
                  </div>
                ) : (
                  <div className="font-semibold text-green-600">مجانية</div>
                )}
                {course.revenue && course.revenue > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {new Intl.NumberFormat("ar-EG", {
                      style: "currency",
                      currency: course.currency,
                      minimumFractionDigits: 0,
                    }).format(course.revenue)}
                  </div>
                )}
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
            إدارة الدورات
          </h1>
          <p className="text-muted-foreground mt-1">
            إنشاء وتعديل وإدارة الدورات التعليمية
          </p>
        </div>
        <Button asChild size="lg" className="shadow-lg">
          <Link href="/admin/courses/new">
            <Plus className="w-4 h-4 mr-2" />
            إضافة دورة جديدة
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الدورات</p>
                <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-green-500/10 to-green-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  الدورات المنشورة
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter((c) => c.isPublished).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الملتحقين</p>
                <p className="text-2xl font-bold text-purple-600">
                  {courses.reduce((sum, c) => sum + c._count.enrollments, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  إجمالي الإيرادات
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {new Intl.NumberFormat("ar-EG", {
                    style: "currency",
                    currency: "EGP",
                    minimumFractionDigits: 0,
                  }).format(
                    courses.reduce((sum, c) => sum + (c.revenue || 0), 0)
                  )}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-500" />
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

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-80 animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
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
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد دورات</h3>
            <p className="text-muted-foreground mb-6">
              {Object.keys(filters).length > 0
                ? "لم يتم العثور على دورات مطابقة للفلاتر المحددة"
                : "لم يتم إنشاء أي دورات بعد"}
            </p>
            <Button asChild>
              <Link href="/admin/courses/new">
                <Plus className="w-4 h-4 mr-2" />
                إضافة أول دورة
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
