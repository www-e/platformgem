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
      className="group perspective-1000"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg overflow-hidden group-hover:scale-[1.02] rounded-2xl">
        <div className="relative aspect-video overflow-hidden">
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
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          {/* Price and category badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.price === null || course.price === 0 ? (
              <Badge className="bg-emerald-500 text-white font-semibold shadow-lg">
                <Star className="w-3 h-3 mr-1" />
                Free
              </Badge>
            ) : (
              <Badge className="bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: course.currency,
                  minimumFractionDigits: 0
                }).format(course.price)}
              </Badge>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-9 h-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-9 h-9 p-0 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
            >
              <Play className="w-6 h-6 text-primary ml-1" />
            </motion.div>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-grow">
          <div className="flex-grow space-y-4">
            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
                {course.category.name}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>4.8</span>
            </div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors font-display mb-2">
              {course.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {course.description}
            </p>
          </div>
          
          {/* Professor info */}
          <div className="flex items-center gap-3 pb-2">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-r from-primary/20 to-secondary/20 text-primary text-sm font-semibold">
                {course.professor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{course.professor.name}</p>
              <p className="text-xs text-muted-foreground">Certified Instructor</p>
            </div>
          </div>
          
          {/* Course stats */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <div className="flex flex-col items-center">
              <Users className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">{course._count.enrollments}</span>
              <span className="text-xs text-muted-foreground">Students</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">{course._count.lessons}</span>
              <span className="text-xs text-muted-foreground">Lessons</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-4 h-4 text-muted-foreground mb-1" />
              <span className="text-xs font-medium">0</span>
              <span className="text-xs text-muted-foreground">Minutes</span>
            </div>
          </div>
          
          {/* Action button */}
          <div className="pt-4 mt-auto">
            <Link href={`/courses/${course.id}`}>
              <Button className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                {userRole === 'STUDENT' ? 'Enroll in Course' : 'View Details'}
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
                  Discover Learning
                </h1>
              </div>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of learners and gain new skills through our exceptional educational courses
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
                  <div className="text-muted-foreground">Educational Courses</div>
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
                  <div className="text-muted-foreground">Active Learners</div>
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
                  <div className="text-muted-foreground">Expert Instructors</div>
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
                  placeholder="Search for courses, instructors, or topics..."
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
                All
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
                  More
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
                      <label className="block text-sm font-medium mb-2">Price</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="0-100">0 - 100 EGP</option>
                        <option value="100-500">100 - 500 EGP</option>
                        <option value="500+">500+ EGP</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="newest">Newest</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating">Highest Rated</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="w-full rounded-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-6">
                <span className="text-sm text-muted-foreground">Active Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchQuery}
                    <button onClick={() => handleSearch('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => handleCategoryFilter('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {priceFilter && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Price: {priceFilter}
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
                  {isLoading ? 'Loading...' : `${totalCount || courses.length} courses`}
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
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
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
                    Previous
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
                    Next
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
            <h3 className="text-2xl font-bold mb-4">No Courses Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Try changing your search criteria or browse all available courses
            </p>
            <Button onClick={clearFilters} size="lg" className="rounded-xl">
              View All Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
