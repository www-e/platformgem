// src/lib/api/categories.ts
import { ApiResponse } from '@/lib/api-utils';

export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courses: number;
  };
  courses?: Array<{
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number | null;
    currency: string;
    professor: {
      id: string;
      name: string;
    };
    _count: {
      enrollments: number;
    };
  }>;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  iconUrl?: string;
  slug: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  iconUrl?: string;
  slug?: string;
  isActive?: boolean;
}

class CategoriesApi {
  private baseUrl = '/api/categories';

  async getAll(includeInactive: boolean = false): Promise<Category[]> {
    const url = `${this.baseUrl}${includeInactive ? '?includeInactive=true' : ''}`;
    const response = await fetch(url);
    const data: ApiResponse<Category[]> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في جلب الفئات');
    }
    
    return data.data || [];
  }

  async getById(id: string): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    const data: ApiResponse<Category> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في جلب الفئة');
    }
    
    return data.data!;
  }

  async create(categoryData: CreateCategoryData): Promise<Category> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    const data: ApiResponse<Category> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في إنشاء الفئة');
    }
    
    return data.data!;
  }

  async update(id: string, categoryData: UpdateCategoryData): Promise<Category> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    });
    
    const data: ApiResponse<Category> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في تحديث الفئة');
    }
    
    return data.data!;
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });
    
    const data: ApiResponse = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'فشل في حذف الفئة');
    }
  }

  // Utility function to generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[^\u0600-\u06FF\w\s-]/g, '') // Keep Arabic, alphanumeric, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50); // Limit length
  }

  // Utility function to validate category data
  validateCategoryData(data: CreateCategoryData | UpdateCategoryData): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('اسم الفئة مطلوب');
      } else if (data.name.length > 100) {
        errors.push('اسم الفئة طويل جداً (الحد الأقصى 100 حرف)');
      }
    }

    if ('description' in data && data.description !== undefined) {
      if (!data.description || data.description.trim().length === 0) {
        errors.push('وصف الفئة مطلوب');
      } else if (data.description.length > 500) {
        errors.push('وصف الفئة طويل جداً (الحد الأقصى 500 حرف)');
      }
    }

    if ('slug' in data && data.slug !== undefined) {
      if (!data.slug || data.slug.trim().length === 0) {
        errors.push('الرابط المختصر مطلوب');
      } else if (data.slug.length > 50) {
        errors.push('الرابط المختصر طويل جداً (الحد الأقصى 50 حرف)');
      } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
        errors.push('الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
      }
    }

    if ('iconUrl' in data && data.iconUrl !== undefined && data.iconUrl !== '') {
      try {
        new URL(data.iconUrl);
      } catch {
        errors.push('رابط الأيقونة غير صحيح');
      }
    }

    return errors;
  }
}

export const categoriesApi = new CategoriesApi();