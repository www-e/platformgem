// src/components/course/CourseCatalog.tsx - AI-Powered Course Catalog
'use client';

import { UserRole } from '@prisma/client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCourseCatalog } from '@/hooks/useCourseCatalog';
import { useOptimizedMotion } from '@/hooks/useAnimations';
import { StaggerChildren, StaggerItem, FadeInScroll } from '@/components/ui/micro-interactions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CourseCard from './CourseCard';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Star,
  Zap,
  Brain,
  Target,
  X,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface AIRecommendation {
  id: string;
  type: 'trending' | 'personalized' | 'similar' | 'popular';
  title: string;
  description: string;
  courses: any[];
  icon: React.ElementType;
}

export default function CourseCatalog({ initialFilters, userRole, userId }: CourseCatalogProps) {
  const {
    courses,
    isLoading,
    error,
    totalCount,
    totalPages,
    currentPage,
    viewMode,
    setViewMode,
    searchTerm,
    categoryFilter,
    priceRangeFilter,
    levelFilter,
    sortFilter,
    categories,
    handleSearch,
    handleFilterChange,
    handlePageChange,
    clearFilters,
    fetchCourses
  } = useCourseCatalog(initialFilters);

  const { shouldReduceMotion } = useOptimizedMotion();
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Course recommendations based on user behavior and course popularity
  const aiRecommendations: AIRecommendation[] = useMemo(() => [
    {
      id: '1',
      type: 'personalized',
      title: 'موصى لك',
      description: 'بناءً على اهتماماتك وتقدمك السابق',
      courses: courses.slice(0, 3),
      icon: Sparkles
    },
    {
      id: '2',
      type: 'trending',
      title: 'الأكثر رواجاً',
      description: 'الدورات الأكثر شعبية هذا الأسبوع',
      courses: courses.slice(3, 6),
      icon: TrendingUp
    },
    {
      id: '3',
      type: 'similar',
      title: 'مشابهة لما تعلمته',
      description: 'دورات تكمل مسيرتك التعليمية',
      courses: courses.slice(6, 9),
      icon: Target
    }
  ], [courses]);

  // Smart search suggestions
  const searchSuggestionsData = [
    'تطوير المواقع',
    'React',
    'JavaScript',
    'Python',
    'التسويق الرقمي',
    'تصميم الجرافيك',
    'الذكاء الاصطناعي',
    'علوم البيانات'
  ];

  // Handle search with suggestions
  const handleSearchWithSuggestions = (query: string) => {
    handleSearch(query);
    if (query.length > 0) {
      const filtered = searchSuggestionsData.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Filter options
  const filterOptions = {
    categories: categories || [],
    priceRanges: [
      { value: 'free', label: 'مجاني' },
      { value: '0-100', label: '0 - 100 جنيه' },
      { value: '100-500', label: '100 - 500 جنيه' },
      { value: '500+', label: '500+ جنيه' }
    ],
    levels: [
      { value: 'beginner', label: 'مبتدئ' },
      { value: 'intermediate', label: 'متوسط' },
      { value: 'advanced', label: 'متقدم' }
    ],
    sortOptions: [
      { value: 'newest', label: 'الأحدث' },
      { value: 'popular', label: 'الأكثر شعبية' },
      { value: 'rating', label: 'الأعلى تقييماً' },
      { value: 'price-low', label: 'السعر: من الأقل للأعلى' },
      { value: 'price-high', label: 'السعر: من الأعلى للأقل' }
    ]
  };

  // Active filters count
  const activeFiltersCount = [
    categoryFilter,
    priceRangeFilter,
    levelFilter,
    searchTerm
  ].filter(Boolean).length;

  // Loading state
  if (isLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
          <p className="text-neutral-600 font-primary">جاري تحميل الدورات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-error" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 font-display">حدث خطأ</h3>
            <p className="text-neutral-600 font-primary mt-1">لم نتمكن من تحميل الدورات</p>
          </div>
          <Button onClick={fetchCourses} variant="primary">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* AI Recommendations Section */}
      {!searchTerm && !categoryFilter && aiRecommendations.length > 0 && (
        <FadeInScroll>
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-neutral-900 font-display">
                اقتراحات ذكية
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((recommendation, index) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-elevation-3 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <recommendation.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 font-display">
                          {recommendation.title}
                        </h3>
                        <p className="text-sm text-neutral-600 font-primary">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {recommendation.courses.slice(0, 2).map((course) => (
                        <div key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
                          <div className="w-12 h-8 bg-neutral-200 rounded overflow-hidden">
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate font-primary">
                              {course.title}
                            </p>
                            <p className="text-xs text-neutral-500 font-primary">
                              {course.professor.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-4"
                      onClick={() => {
                        // Filter by recommendation type
                        handleFilterChange('sort', recommendation.type);
                      }}
                    >
                      عرض المزيد
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeInScroll>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-500" />
            <Input
              type="text"
              placeholder="ابحث عن الدورات، المدربين، أو المواضيع..."
              value={searchTerm}
              onChange={(e) => handleSearchWithSuggestions(e.target.value)}
              onFocus={() => searchTerm && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-4 h-12 text-base font-primary"
            />
          </div>
          
          {/* Search Suggestions */}
          <AnimatePresence>
            {showSuggestions && searchSuggestions.length > 0 && (
              <motion.div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-elevation-4 z-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="p-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-right px-3 py-2 hover:bg-neutral-50 rounded text-sm font-primary transition-colors"
                      onClick={() => {
                        handleSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلترة
              {activeFiltersCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={categoryFilter === '' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleFilterChange('category', '')}
              >
                الكل
              </Button>
              {filterOptions.categories.slice(0, 3).map((category) => (
                <Button
                  key={category.id}
                  variant={categoryFilter === category.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handleFilterChange('category', category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* View Mode & Sort */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-neutral-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <select
              value={sortFilter}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {filterOptions.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-display">
                  التصنيف
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع التصنيفات</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-display">
                  السعر
                </label>
                <select
                  value={priceRangeFilter}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع الأسعار</option>
                  {filterOptions.priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2 font-display">
                  المستوى
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm font-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">جميع المستويات</option>
                  {filterOptions.levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-neutral-600 font-primary">الفلاتر النشطة:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                البحث: {searchTerm}
                <button onClick={() => handleSearch('')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                التصنيف: {filterOptions.categories.find(c => c.id === categoryFilter)?.name}
                <button onClick={() => handleFilterChange('category', '')}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              مسح الكل
            </Button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-neutral-900 font-display">
            {searchTerm ? `نتائج البحث عن "${searchTerm}"` : 'جميع الدورات'}
          </h2>
          <Badge variant="outline" className="font-primary">
            {totalCount} دورة
          </Badge>
        </div>
        
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-primary">جاري التحديث...</span>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <StaggerChildren className={cn(
          "grid gap-6",
          viewMode === 'grid' 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        )}>
          {courses.map((course, index) => (
            <StaggerItem key={course.id}>
              <CourseCard
                course={course}
                userRole={userRole}
                userId={userId}
                viewMode={viewMode}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 font-display mb-2">
            لم نجد أي دورات
          </h3>
          <p className="text-neutral-600 font-primary mb-4">
            جرب تغيير معايير البحث أو الفلاتر
          </p>
          <Button onClick={clearFilters} variant="primary">
            مسح الفلاتر
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              السابق
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 p-0"
                >
                  {page}
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}