// src/components/course/ModernCourseCatalog.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Grid3X3, 
  List, 
  Star,
  Users,
  BookOpen,
  Play,
  Heart,
  Share2,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  GraduationCap,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatAdminDate } from "@/lib/date-utils";

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

interface Category {
  id: string;
  name: string;
  iconUrl?: string;
}

interface ModernCourseCatalogProps {
  initialFilters: {
    page: number;
    category?: string;
    search?: string;
    priceRange?: string;
    level?: string;
    sort: string;
    limit: number;
  };
  userRole?: string;
  userId?: string;
  categories: Category[];
  featuredCourses: Course[];
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalProfessors: number;
  };
}

const ITEMS_PER_PAGE = 12;

export function ModernCourseCatalog({
  initialFilters,
  userRole,
  categories,
  featuredCourses,
  stats
}: ModernCourseCatalogProps) {
  const [courses, setCourses] = useState<Course[]>(featuredCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category || '');
  const [priceFilter, setPriceFilter] = useState(initialFilters.priceRange || '');
  const [sortBy, setSortBy] = useState(initialFilters.sort);

  useEffect(() => {
    if (searchQuery || selectedCategory || priceFilter || currentPage > 1) {
      fetchCourses();
    }
  }, [searchQuery, selectedCategory, priceFilter, sortBy, currentPage]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(priceFilter && { priceRange: priceFilter }),
        sort: sortBy
      });

      const response = await fetch(`/api/courses?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setCourses(data.courses || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceFilter('');
    setSortBy('newest');
    setCurrentPage(1);
    setCourses(featuredCourses);
  };

  const activeFiltersCount = [searchQuery, selectedCategory, priceFilter].filter(Boolean).length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const CourseCard = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm overflow-hidden group-hover:scale-[1.02]">
        <div className="relative">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
            {course.thumbnailUrl ? (
              <img 
                src={course.thumbnailUrl} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-primary/40" />
              </div>
            )}
          </div>
          
          {/* Overlay with play button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Play className="w-6 h-6 text-primary ml-1" />
            </motion.div>
          </div>
          
          {/* Price badge */}
          <div className="absolute top-3 right-3">
            {course.price === null ? (
              <Badge className="bg-green-500 text-white border-0 shadow-lg">
                مجاني
              </Badge>
            ) : (
              <Badge className="bg-primary text-white border-0 shadow-lg">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: course.currency,
                  minimumFractionDigits: 0
                }).format(course.price)}
              </Badge>
            )}
          </div>
          
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
              {course.category.name}
            </Badge>
          </div>
          
          {/* Action buttons */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm hover:bg-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Course title and description */}
            <div>
              <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors mb-2">
                {course.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {course.description}
              </p>
            </div>

            {/* Professor info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {course.professor.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{course.professor.name}</p>
                <p className="text-xs text-muted-foreground">مدرب معتمد</p>
              </div>
            </div>

            {/* Course stats */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course._count.enrollments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{course._count.lessons}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>4.8</span>
                </div>
              </div>
              <div className="text-xs">
                {formatAdminDate(course.createdAt)}
              </div>
            </div>

            {/* Action button */}
            <Link href={`/courses/${course.id}`}>
              <Button className="w-full group-hover:bg-primary group-hover:text-white transition-all duration-300">
                {userRole === 'STUDENT' ? 'التسجيل في الدورة' : 'عرض التفاصيل'}
                <ChevronRight className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  اكتشف عالم التعلم
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                انضم إلى آلاف الطلاب واكتسب مهارات جديدة من خلال دوراتنا التعليمية المتميزة
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stats.totalCourses}+</div>
                  <div className="text-muted-foreground">دورة تعليمية</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalStudents}+</div>
                  <div className="text-muted-foreground">طالب نشط</div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <GraduationCap className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalProfessors}+</div>
                  <div className="text-muted-foreground">مدرب خبير</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث عن الدورات، المدربين، أو المواضيع..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl focus:shadow-xl transition-all duration-300"
                />
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Button
                variant={selectedCategory === '' ? 'primary' : 'outline'}
                onClick={() => handleCategoryFilter('')}
                className="rounded-full"
              >
                الكل
              </Button>
              {categories.slice(0, 6).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  onClick={() => handleCategoryFilter(category.id)}
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
              {categories.length > 6 && (
                <Button
                  variant="ghost"
                  onClick={() => setShowFilters(!showFilters)}
                  className="rounded-full"
                >
                  المزيد
                  <ChevronDown className={cn("w-4 h-4 mr-2 transition-transform", showFilters && "rotate-180")} />
                </Button>
              )}
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">السعر</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">جميع الأسعار</option>
                        <option value="free">مجاني</option>
                        <option value="0-100">0 - 100 جنيه</option>
                        <option value="100-500">100 - 500 جنيه</option>
                        <option value="500+">500+ جنيه</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">الترتيب</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="newest">الأحدث</option>
                        <option value="popular">الأكثر شعبية</option>
                        <option value="rating">الأعلى تقييماً</option>
                        <option value="price-low">السعر: من الأقل للأعلى</option>
                        <option value="price-high">السعر: من الأعلى للأقل</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        مسح الفلاتر
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    البحث: {searchQuery}
                    <button onClick={() => handleSearch('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    التصنيف: {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => handleCategoryFilter('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {priceFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    السعر: {priceFilter}
                    <button onClick={() => setPriceFilter('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

            {/* View Controls */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {isLoading ? 'جاري التحميل...' : `${totalCount || courses.length} دورة`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-white/80">
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="p-2 rounded-lg"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="p-2 rounded-lg"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-96 animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6 space-y-4">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <>
            <div className={cn(
              "grid gap-8 mb-12",
              viewMode === 'grid' 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            )}>
              {courses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="rounded-xl"
                  >
                    السابق
                  </Button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        onClick={() => setCurrentPage(page)}
                        className="w-12 h-12 rounded-xl"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="rounded-xl"
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-4">لم نجد أي دورات</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              جرب تغيير معايير البحث أو تصفح جميع الدورات المتاحة
            </p>
            <Button onClick={clearFilters} size="lg" className="rounded-xl">
              عرض جميع الدورات
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}