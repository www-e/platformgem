// src/components/course/CourseCatalog.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  SortAsc,
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CourseWithMetadata, CourseCatalogResponse, CourseFilters } from '@/types/course';
import { formatCoursePrice, formatCourseDuration } from '@/lib/course-utils';
import CourseCard from './CourseCard';

interface CourseCatalogProps {
  initialFilters: {
    page: number;
    category?: string;
    search?: string;
    priceRange?: string;
    level?: string;
    sort: string;
    limit: number;
  };
  userRole?: UserRole;
  userId?: string;
}

export default function CourseCatalog({ initialFilters, userRole, userId }: CourseCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [courses, setCourses] = useState<CourseWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
  const [categoryFilter, setCategoryFilter] = useState(initialFilters.category || 'all');
  const [priceRangeFilter, setPriceRangeFilter] = useState(initialFilters.priceRange || 'all');
  const [levelFilter, setLevelFilter] = useState(initialFilters.level || 'all');
  const [sortFilter, setSortFilter] = useState(initialFilters.sort);
  
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);

  // Fetch courses based on current filters
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', initialFilters.limit.toString());
      params.set('sort', sortFilter);
      
      if (searchTerm) params.set('search', searchTerm);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (priceRangeFilter !== 'all') params.set('priceRange', priceRangeFilter);
      if (levelFilter !== 'all') params.set('level', levelFilter);
      
      const response = await fetch(`/api/courses?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data: CourseCatalogResponse = await response.json();
      
      setCourses(data.courses);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في تحميل الدورات');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter, priceRangeFilter, levelFilter, sortFilter, initialFilters.limit]);

  // Fetch categories for filter dropdown
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (currentPage > 1) params.set('page', currentPage.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (priceRangeFilter !== 'all') params.set('priceRange', priceRangeFilter);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (sortFilter !== 'newest') params.set('sort', sortFilter);
    
    const newURL = `/courses${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL, { scroll: false });
  }, [currentPage, searchTerm, categoryFilter, priceRangeFilter, levelFilter, sortFilter, router]);

  // Effects
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value);
        break;
      case 'priceRange':
        setPriceRangeFilter(value);
        break;
      case 'level':
        setLevelFilter(value);
        break;
      case 'sort':
        setSortFilter(value);
        break;
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render loading state
  if (isLoading && courses.length === 0) {
    return <CourseCatalogSkeleton />;
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          عذراً، حدث خطأ في تحميل الدورات
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchCourses} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والتصفية
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الدورات..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select value={priceRangeFilter} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger>
                <SelectValue placeholder="السعر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأسعار</SelectItem>
                <SelectItem value="free">مجاني</SelectItem>
                <SelectItem value="paid">مدفوع</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortFilter} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger>
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">الأحدث</SelectItem>
                <SelectItem value="oldest">الأقدم</SelectItem>
                <SelectItem value="title">الاسم</SelectItem>
                <SelectItem value="price_low">السعر: من الأقل للأعلى</SelectItem>
                <SelectItem value="price_high">السعر: من الأعلى للأقل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          عرض {courses.length} من أصل {totalCount} دورة
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            جاري التحميل...
          </div>
        )}
      </div>

      {/* Courses Grid/List */}
      {courses.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              userRole={userRole}
              userId={userId}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد دورات مطابقة للبحث
          </h3>
          <p className="text-gray-600 mb-4">
            جرب تغيير معايير البحث أو التصفية للعثور على دورات أخرى
          </p>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setPriceRangeFilter('all');
              setLevelFilter('all');
              setCurrentPage(1);
            }}
            variant="outline"
          >
            إعادة تعيين الفلاتر
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Loading skeleton component
function CourseCatalogSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}