// src/hooks/useCourseManagement.ts
'use client';

import { useState, useEffect, useMemo } from 'react';

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

export function useCourseManagement() {
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
      const responseData = await response.json();
      
      console.log('Raw courses API response:', responseData);
      
      // Extract courses from API response - handle nested structure
      let coursesData = [];
      if (responseData.success && responseData.data) {
        // New wrapped response with pagination: { success: true, data: { data: [...], pagination: {...} } }
        if (responseData.data.data) {
          coursesData = responseData.data.data;
        } else if (responseData.data.courses) {
          // Fallback for potential different structure
          coursesData = responseData.data.courses;
        } else if (Array.isArray(responseData.data)) {
          // In case data is directly an array
          coursesData = responseData.data;
        }
      } else if (responseData.courses) {
        // Direct courses array (fallback)
        coursesData = responseData.courses;
      } else if (Array.isArray(responseData)) {
        // Response is directly an array (fallback)
        coursesData = responseData;
      }
      
      console.log('Extracted courses data:', coursesData);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseStats = async () => {
    try {
      const response = await fetch('/api/admin/course-stats');
      const responseData = await response.json();
      
      if (response.ok) {
        // Extract actual data from the API response wrapper
        const statsData = responseData.success ? responseData.data : responseData;
        console.log('Course stats fetched successfully:', statsData);
        setStats(statsData);
      } else {
        console.error('Failed to fetch course stats:', responseData.error || responseData);
      }
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

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
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
  }, [courses, searchTerm, categoryFilter, statusFilter, professorFilter]);

  // Get unique categories and professors for filters
  const categories = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.category.id)))
      .map(id => courses.find(c => c.category.id === id)?.category)
      .filter((category): category is NonNullable<typeof category> => Boolean(category));
  }, [courses]);
  
  const professors = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.professor.id)))
      .map(id => courses.find(c => c.professor.id === id)?.professor)
      .filter((professor): professor is NonNullable<typeof professor> => Boolean(professor));
  }, [courses]);

  return {
    courses,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    professorFilter,
    setProfessorFilter,
    filteredCourses,
    categories,
    professors,
    handleCourseAction,
    refetch: fetchCourses
  };
}

export type { CourseData, CourseStats };