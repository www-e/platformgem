// src/components/admin/CourseManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  Filter,
  Plus,
  MoreHorizontal,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CourseData {
  id: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  professor: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
  _count: {
    enrollments: number;
    lessons: number;
  };
  revenue?: number;
}

interface CourseStats {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  averagePrice: number;
}

export function CourseManagement() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [professorFilter, setProfessorFilter] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
    fetchCourseStats();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses');
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseStats = async () => {
    try {
      const response = await fetch('/api/admin/course-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch course stats:', error);
    }
  };

  const handleCourseAction = async (courseId: string, action: 'publish' | 'unpublish' | 'delete') => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchCourses(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to perform course action:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.professor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category.id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && course.isPublished) ||
                         (statusFilter === 'draft' && !course.isPublished);
    const matchesProfessor = professorFilter === 'all' || course.professor.id === professorFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesProfessor;
  });

  // Get unique categories and professors for filters
  const categories = Array.from(new Set(courses.map(c => c.category.id)))
    .map(id => courses.find(c => c.category.id === id)?.category)
    .filter(Boolean);
  
  const professors = Array.from(new Set(courses.map(c => c.professor.id)))
    .map(id => courses.find(c => c.professor.id === id)?.professor)
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الدورات</h2>
          <p className="text-muted-foreground">
            إدارة محتوى الدورات والموافقة على النشر
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          إضافة دورة
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الدورات</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.publishedCourses} منشورة • {stats.draftCourses} مسودة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التسجيلات</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalCourses > 0 ? (stats.totalEnrollments / stats.totalCourses).toFixed(1) : 0} متوسط لكل دورة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP',
                  minimumFractionDigits: 0
                }).format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                من جميع الدورات
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط السعر</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP',
                  minimumFractionDigits: 0
                }).format(stats.averagePrice)}
              </div>
              <p className="text-xs text-muted-foreground">
                متوسط سعر الدورة
              </p>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث بعنوان الدورة أو المدرس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالتصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category!.id} value={category!.id}>
                    {category!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="published">منشورة</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={professorFilter} onValueChange={setProfessorFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية بالمدرس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المدرسين</SelectItem>
                {professors.map((professor) => (
                  <SelectItem key={professor!.id} value={professor!.id}>
                    {professor!.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الدورات ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{course.title}</h3>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'منشورة' : 'مسودة'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course._count.enrollments} طالب
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course._count.lessons} درس
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(course.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{course.category.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        بواسطة {course.professor.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {course.price 
                        ? new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: course.currency || 'EGP',
                            minimumFractionDigits: 0
                          }).format(course.price)
                        : 'مجاني'
                      }
                    </div>
                    {course.revenue && (
                      <div className="text-sm text-muted-foreground">
                        إيراد: {new Intl.NumberFormat('ar-EG', {
                          style: 'currency',
                          currency: 'EGP',
                          minimumFractionDigits: 0
                        }).format(course.revenue)}
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      عرض التفاصيل
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      تعديل الدورة
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCourseAction(course.id, course.isPublished ? 'unpublish' : 'publish')}
                    >
                      {course.isPublished ? 'إلغاء النشر' : 'نشر الدورة'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => handleCourseAction(course.id, 'delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      حذف الدورة
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            
            {filteredCourses.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">لا توجد نتائج مطابقة للبحث</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}