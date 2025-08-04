// src/hooks/useRecommendedCourses.ts
"use client";

import { useState, useEffect, useMemo } from 'react';

interface RecommendedCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  enrollmentCount: number;
  duration: number; // in minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  category: {
    id: string;
    name: string;
    slug: string;
  };
  professor: {
    id: string;
    name: string;
    expertise: string[];
  };
  lessons: {
    id: string;
    title: string;
    duration: number;
  }[];
  tags: string[];
  recommendationReason: 'category_match' | 'similar_students' | 'trending' | 'professor_match' | 'completion_based';
  recommendationScore: number;
  isWishlisted: boolean;
  previewVideoUrl?: string;
}

interface RecommendationFilters {
  category: string;
  priceRange: string;
  level: string;
  duration: string;
  rating: string;
}

export function useRecommendedCourses() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<RecommendationFilters>({
    category: 'all',
    priceRange: 'all',
    level: 'all',
    duration: 'all',
    rating: 'all'
  });

  useEffect(() => {
    fetchRecommendedCourses();
  }, [filters]);

  const fetchRecommendedCourses = async () => {
    try {
      const queryParams = new URLSearchParams({
        category: filters.category,
        priceRange: filters.priceRange,
        level: filters.level,
        duration: filters.duration,
        rating: filters.rating
      });

      const response = await fetch(`/api/student/recommended-courses?${queryParams}`);
      const data = await response.json();
      setCourses(data.courses);
    } catch (error) {
      console.error('Failed to fetch recommended courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (courseId: string) => {
    try {
      const response = await fetch('/api/student/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setCourses(courses.map(course => 
          course.id === courseId 
            ? { ...course, isWishlisted: !course.isWishlisted }
            : course
        ));
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (filters.category !== 'all' && course.category.id !== filters.category) return false;
      
      if (filters.priceRange !== 'all') {
        const price = course.price;
        switch (filters.priceRange) {
          case 'free':
            if (price > 0) return false;
            break;
          case 'under_100':
            if (price >= 100) return false;
            break;
          case '100_500':
            if (price < 100 || price >= 500) return false;
            break;
          case 'over_500':
            if (price < 500) return false;
            break;
        }
      }
      
      if (filters.level !== 'all' && course.level !== filters.level) return false;
      
      if (filters.duration !== 'all') {
        const duration = course.duration;
        switch (filters.duration) {
          case 'short':
            if (duration >= 120) return false; // Less than 2 hours
            break;
          case 'medium':
            if (duration < 120 || duration >= 480) return false; // 2-8 hours
            break;
          case 'long':
            if (duration < 480) return false; // More than 8 hours
            break;
        }
      }
      
      if (filters.rating !== 'all') {
        const rating = course.rating;
        const minRating = parseFloat(filters.rating);
        if (rating < minRating) return false;
      }
      
      return true;
    });
  }, [courses, filters]);

  const resetFilters = () => {
    setFilters({
      category: 'all',
      priceRange: 'all',
      level: 'all',
      duration: 'all',
      rating: 'all'
    });
  };

  return {
    courses,
    isLoading,
    filters,
    setFilters,
    filteredCourses,
    toggleWishlist,
    resetFilters,
    refetch: fetchRecommendedCourses
  };
}

export type { RecommendedCourse, RecommendationFilters };