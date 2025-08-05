// src/components/professor/ProfessorCourseManagement.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  BookOpen,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Plus,
  Settings
} from "lucide-react";
import { deleteCourse } from "@/lib/actions";
import { toast } from "sonner";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: any; // Decimal type from Prisma
  currency: string;
  isPublished: boolean;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    enrollments: number;
    lessons: number;
  };
}

interface ProfessorCourseManagementProps {
  courses: Course[];
}

export function ProfessorCourseManagement({ courses: initialCourses }: ProfessorCourseManagementProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortBy, setSortBy] = useState<"title" | "enrollments" | "lessons" | "created">("created");

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "published" && course.isPublished) ||
                           (statusFilter === "draft" && !course.isPublished);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title, 'ar');
        case "enrollments":
          return b._count.enrollments - a._count.enrollments;
        case "lessons":
          return b._count.lessons - a._count.lessons;
        case "created":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleDelete = async (courseId: string) => {
    try {
      const result = await deleteCourse(courseId);
      if (result.success) {
        setCourses(prev => prev.filter(course => course.id !== courseId));
        toast.success(result.success);
      } else {
        toast.error(result.error || "فشل في حذف الدورة");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الدورة");
    }
  };

  const formatPrice = (course: Course): string => {
    if (!course.price || course.price === 0) {
      return 'مجاني';
    }
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Number(course.price));
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="البحث في الدورات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الدورات</SelectItem>
            <SelectItem value="published">المنشورة فقط</SelectItem>
            <SelectItem value="draft">المسودات فقط</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">الأحدث</SelectItem>
            <SelectItem value="title">الاسم</SelectItem>
            <SelectItem value="enrollments">عدد الطلاب</SelectItem>
            <SelectItem value="lessons">عدد الدروس</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-8">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">لا توجد نتائج</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            جرب تغيير معايير البحث أو الفلترة
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="border rounded-lg overflow-hidden">
              {/* Course Image */}
              <div className="aspect-video bg-muted relative">
                <img 
                  src={course.thumbnailUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-course.jpg';
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        منشور
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        مسودة
                      </>
                    )}
                  </Badge>
                </div>
                <div className="absolute top-2 left-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/professor/courses/${course.id}`}>
                          <Settings className="w-4 h-4 mr-2" />
                          إدارة الدورة
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/professor/courses/${course.id}/edit`}>
                          <Edit className="w-4 h-4 mr-2" />
                          تعديل
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            onSelect={(e: Event) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                            disabled={course._count.enrollments > 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            حذف
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف دورة "{course.title}"؟ 
                              هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(course.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-4 space-y-3">
                {/* Title and Category */}
                <div>
                  <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">{course.category.name}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description}
                </p>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>طلاب</span>
                    </div>
                    <div className="text-sm font-semibold">{course._count.enrollments}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>دروس</span>
                    </div>
                    <div className="text-sm font-semibold">{course._count.lessons}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <DollarSign className="w-3 h-3" />
                      <span>السعر</span>
                    </div>
                    <div className="text-sm font-semibold">{formatPrice(course)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/professor/courses/${course.id}`}>
                      <Settings className="w-4 h-4" />
                      إدارة
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/professor/courses/${course.id}/edit`}>
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Link>
                  </Button>
                </div>

                {/* Created Date */}
                <div className="flex items-center text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="w-3 h-3 mr-1" />
                  تم الإنشاء: {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}