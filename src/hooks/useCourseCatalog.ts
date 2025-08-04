// src/hooks/useCourseCatalog.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@prisma/client';
import { CourseWithMetadata, CourseCatalogResponse } from '@/types/course';

interface CatalogFilters {
  page: number;
  category?: string;
  search?: string;
  priceRange?: string;
  level?: string;
  sort: string;
  limit: number;
}

interface Category {
  id: string;
  name: string;
}

export function useCourseCatalog(initialFilters: CatalogFilters) {
  const router = useRouter();
  
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
  
  const [categories, setCategories] = useState<Category[]>([]);

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

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPriceRangeFilter('all');
    setLevelFilter('all');
    setCurrentPage(1);
  };

  return {
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
  };
}

export type { CatalogFilters, Category };