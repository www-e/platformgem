// src/hooks/useCreateCourseForm.ts
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  name: string;
  email: string;
}

interface CourseFormData {
  title: string;
  description: string;
  categoryId: string;
  professorId: string;
  price: string;
  currency: string;
  thumbnailUrl: string;
  bunnyLibraryId: string;
  isPublished: boolean;
}

export function useCreateCourseForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: '',
    professorId: '',
    price: '',
    currency: 'EGP',
    thumbnailUrl: '',
    bunnyLibraryId: '',
    isPublished: false
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProfessors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Handle the API response structure
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('فشل في تحميل التصنيفات');
      setCategories([]); // Set empty array as fallback
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/users?role=PROFESSOR');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Handle the API response structure
      setProfessors(data.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch professors:', error);
      toast.error('فشل في تحميل قائمة المدرسين');
      setProfessors([]); // Set empty array as fallback
    }
  };

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleThumbnailUpload = (files: any[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: files[0].url
      }));
      toast.success('تم رفع صورة الدورة بنجاح');
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.categoryId);
      case 2:
        return !!(formData.professorId && formData.bunnyLibraryId);
      case 3:
        return !!(formData.thumbnailUrl);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    } else {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error('يرجى إكمال جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null
        }),
      });

      // Check if response is ok first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        toast.error(`خطأ في الخادم: ${response.status}`);
        return;
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        toast.error('استجابة غير صحيحة من الخادم');
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast.success('تم إنشاء الدورة بنجاح');
        router.push(`/admin/courses/${result.course.id}`);
      } else {
        toast.error(result.error || 'فشل في إنشاء الدورة');
      }
    } catch (error) {
      console.error('Course creation error:', error);
      if (error instanceof SyntaxError) {
        toast.error('خطأ في تحليل استجابة الخادم');
      } else {
        toast.error('حدث خطأ في إنشاء الدورة');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    categories,
    professors,
    isLoading,
    currentStep,
    handleInputChange,
    handleThumbnailUpload,
    validateStep,
    handleNext,
    handlePrevious,
    handleSubmit
  };
}

export type { CourseFormData, Category, Professor };