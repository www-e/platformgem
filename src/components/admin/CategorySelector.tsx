// src/components/admin/CategorySelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoriesApi, Category } from "@/lib/api/categories";
import { FolderOpen, AlertCircle } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
  showAll?: boolean;
  placeholder?: string;
  required?: boolean;
  name?: string;
}

export function CategorySelector({ 
  selectedCategory, 
  onCategoryChange, 
  showAll = false,
  placeholder = "اختر الفئة",
  required = false,
  name = "categoryId"
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await categoriesApi.getAll(showAll);
        setCategories(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في جلب الفئات');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, [showAll]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
        <div className="h-11 border border-destructive/20 rounded-md flex items-center justify-center bg-destructive/5">
          <span className="text-sm text-muted-foreground">غير متاح</span>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm">لا توجد فئات متاحة</span>
        </div>
        <div className="h-11 border border-border rounded-md flex items-center justify-center bg-muted/20">
          <span className="text-sm text-muted-foreground">يجب إنشاء فئة أولاً</span>
        </div>
      </div>
    );
  }

  return (
    <Select 
      name={name}
      value={selectedCategory} 
      onValueChange={onCategoryChange}
      required={required}
    >
      <SelectTrigger className="h-11">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            <div className="flex items-center justify-between w-full">
              <span>{category.name}</span>
              <div className="flex items-center gap-2 mr-2">
                {category._count && (
                  <Badge variant="outline" className="text-xs">
                    {category._count.courses} دورة
                  </Badge>
                )}
                {!category.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    غير نشط
                  </Badge>
                )}
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Simplified version for forms
export function SimpleCategorySelector({ 
  selectedCategory, 
  onCategoryChange, 
  placeholder = "اختر الفئة",
  required = false,
  name = "categoryId"
}: Omit<CategorySelectorProps, 'showAll'>) {
  return (
    <CategorySelector
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      placeholder={placeholder}
      required={required}
      name={name}
      showAll={false}
    />
  );
}