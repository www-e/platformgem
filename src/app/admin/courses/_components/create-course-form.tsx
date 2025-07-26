// src/app/admin/courses/_components/create-course-form.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending}>
      {pending ? "جاري الإنشاء..." : "إنشاء الدورة"}
    </Button>
  );
}

interface CreateCourseFormProps {
  onFormSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
}

interface Professor {
  id: string;
  name: string;
}

export function CreateCourseForm({ onFormSuccess }: CreateCourseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories and professors
  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, professorsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/users?role=PROFESSOR')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
        }

        if (professorsRes.ok) {
          const professorsData = await professorsRes.json();
          setProfessors(professorsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const courseData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        thumbnailUrl: formData.get('thumbnailUrl') as string,
        categoryId: formData.get('categoryId') as string,
        professorId: formData.get('professorId') as string,
        bunnyLibraryId: formData.get('bunnyLibraryId') as string,
        price: formData.get('price') ? Number(formData.get('price')) : 0,
        currency: 'EGP'
      };

      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        toast.success("تم إنشاء الدورة بنجاح!");
        formRef.current?.reset();
        onFormSuccess();
      } else {
        const error = await response.json();
        toast.error("فشل في إنشاء الدورة", { description: error.message });
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء الدورة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>إنشاء دورة جديدة</DialogTitle>
        <DialogDescription className="pt-1">
          املأ التفاصيل لإضافة دورة جديدة. ستظهر في قائمة الدورات فورًا.
        </DialogDescription>
      </DialogHeader>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="title">عنوان الدورة</Label>
          <Input id="title" name="title" placeholder="مثال: تطوير تطبيقات الويب" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">وصف الدورة</Label>
          <Input id="description" name="description" placeholder="دورة شاملة لـ..." required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="thumbnailUrl">رابط الصورة المصغرة</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://path/to/image.jpg" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoryId">الفئة</Label>
          <Select name="categoryId" required>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="professorId">الأستاذ</Label>
          <Select name="professorId" required>
            <SelectTrigger>
              <SelectValue placeholder="اختر الأستاذ" />
            </SelectTrigger>
            <SelectContent>
              {professors.map((professor) => (
                <SelectItem key={professor.id} value={professor.id}>
                  {professor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">السعر (اتركه فارغاً للدورات المجانية)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            min="0" 
            step="0.01" 
            placeholder="0 للدورات المجانية" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bunnyLibraryId">معرف مكتبة الفيديو</Label>
          <Input 
            id="bunnyLibraryId" 
            name="bunnyLibraryId" 
            placeholder="معرف مكتبة Bunny CDN" 
            required 
          />
        </div>
        
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">إلغاء</Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء الدورة"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}