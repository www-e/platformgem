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
      .filter(Boolean);
  }, [courses]);
  
  const professors = useMemo(() => {
    return Array.from(new Set(courses.map(c => c.professor.id)))
      .map(id => courses.find(c => c.professor.id === id)?.professor)
      .filter(Boolean);
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