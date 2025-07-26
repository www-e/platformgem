// src/lib/api/courses.ts
import { ApiResponse } from '@/lib/api-utils';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number | null;
  currency: string;
  isPublished: boolean;
  bunnyLibraryId: string;
  categoryId: string;
  professorId: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  category: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  professor: {
    id: string;
    name: string;
    bio: string | null;
    expertise?: string[];
  };
  lessons?: Array<{
    id: string;
    title: string;
    order: number;
    duration: number | null;
    bunnyVideoId: string;
    materials: any;
  }>;
  
  // Counts
  _count: {
    enrollments: number;
    lessons: number;
  };
  
  // User-specific data (when authenticated)
  isEnrolled?: boolean;
  userProgress?: {
    id: string;
    enrolledAt: string;
    progressPercent: number;
    completedLessonIds: string[];
    totalWatchTime: number;
    lastAccessedAt: string | null;
  };
  canEdit?: boolean;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnailUrl: string;
  categoryId: string;
  bunnyLibraryId: string;
  price?: number;
  currency?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  categoryId?: string;
  bunnyLibraryId?: string;
  price?: number | null;
  currency?: string;
  isPublished?: boolean;
}

export interface CourseFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  professorId?: string;
  search?: string;
  priceFilter?: 'free' | 'paid' | 'all';
  sortBy?: 'created' | 'title' | 'price' | 'enrollments';
  sortOrder?: 'asc' | 'desc';
  publishedOnly?: boolean;
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: CourseFilters;
}

class CoursesApi {
  private baseUrl = '/api/courses';

  async getAll(filters: CourseFilters = {}): Promise<CoursesResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    const data: ApiResponse<CoursesResponse> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في جلب الدورات');
    }
    
    return data.data!;
  }

  async getById(id: string, includeUnpublished: boolean = false): Promise<Course> {
    const params = includeUnpublished ? '?includeUnpublished=true' : '';
    const response = await fetch(`${this.baseUrl}/${id}${params}`);
    const data: ApiResponse<Course> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في جلب الدورة');
    }
    
    return data.data!;
  }

  async create(courseData: CreateCourseData): Promise<Course> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    const data: ApiResponse<Course> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في إنشاء الدورة');
    }
    
    return data.data!;
  }

  async update(id: string, courseData: UpdateCourseData): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(courseData),
    });
    
    const data: ApiResponse<Course> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في تحديث الدورة');
    }
    
    return data.data!;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في حذف الدورة');
    }
  }

  async enroll(courseId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${courseId}/enroll`, {
      method: 'POST',
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في التسجيل في الدورة');
    }
    
    return data.data;
  }

  async unenroll(courseId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${courseId}/enroll`, {
      method: 'DELETE',
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في إلغاء التسجيل من الدورة');
    }
  }

  // Utility functions
  formatPrice(course: Course): string {
    if (!course.price || course.price === 0) {
      return 'مجاني';
    }
    
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: course.currency || 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(course.price);
  }

  calculateProgress(course: Course): number {
    if (!course.userProgress || !course.lessons) {
      return 0;
    }
    
    const totalLessons = course.lessons.length;
    const completedLessons = course.userProgress.completedLessonIds.length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  getEnrollmentStatus(course: Course): 'not_enrolled' | 'enrolled' | 'completed' {
    if (!course.isEnrolled) {
      return 'not_enrolled';
    }
    
    const progress = this.calculateProgress(course);
    return progress === 100 ? 'completed' : 'enrolled';
  }

  validateCourseData(data: CreateCourseData | UpdateCourseData): string[] {
    const errors: string[] = [];

    if ('title' in data && data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push('عنوان الدورة مطلوب');
      } else if (data.title.length > 200) {
        errors.push('عنوان الدورة طويل جداً (الحد الأقصى 200 حرف)');
      }
    }

    if ('description' in data && data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        errors.push('وصف الدورة مطلوب');
      } else if (data.description.length > 2000) {
        errors.push('وصف الدورة طويل جداً (الحد الأقصى 2000 حرف)');
      }
    }

    if ('thumbnailUrl' in data && data.thumbnailUrl !== undefined) {
      if (!data.thumbnailUrl || data.thumbnailUrl.trim().length === 0) {
        errors.push('رابط الصورة المصغرة مطلوب');
      } else {
        try {
          new URL(data.thumbnailUrl);
        } catch {
          errors.push('رابط الصورة المصغرة غير صحيح');
        }
      }
    }

    if ('categoryId' in data && data.categoryId !== undefined) {
      if (!data.categoryId || data.categoryId.trim().length === 0) {
        errors.push('فئة الدورة مطلوبة');
      }
    }

    if ('bunnyLibraryId' in data && data.bunnyLibraryId !== undefined) {
      if (!data.bunnyLibraryId || data.bunnyLibraryId.trim().length === 0) {
        errors.push('معرف مكتبة Bunny مطلوب');
      }
    }

    if ('price' in data && data.price !== undefined && data.price !== null) {
      if (data.price < 0) {
        errors.push('السعر لا يمكن أن يكون سالباً');
      }
    }

    return errors;
  }
}

export const coursesApi = new CoursesApi();