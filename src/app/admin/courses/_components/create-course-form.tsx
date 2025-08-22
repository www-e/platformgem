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
      {pending ? "Creating..." : "Create Course"}
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
        toast.success("Course created successfully!");
        formRef.current?.reset();
        onFormSuccess();
      } else {
        const error = await response.json();
        toast.error("Failed to create course", { description: error.message });
      }
    } catch (error) {
      toast.error("An error occurred while creating the course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create New Course</DialogTitle>
        <DialogDescription className="pt-1">
          Fill in the details to add a new course. It will appear in the courses list immediately.
        </DialogDescription>
      </DialogHeader>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="title">Course Title</Label>
          <Input id="title" name="title" placeholder="Example: Web Application Development" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Course Description</Label>
          <Input id="description" name="description" placeholder="Comprehensive course on..." required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://path/to/image.jpg" required />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Select name="categoryId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
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
          <Label htmlFor="professorId">Professor</Label>
          <Select name="professorId" required>
            <SelectTrigger>
              <SelectValue placeholder="Select Professor" />
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
          <Label htmlFor="price">Price (Leave blank for free courses)</Label>
          <Input 
            id="price" 
            name="price" 
            type="number" 
            min="0" 
            step="0.01" 
            placeholder="0 for free courses" 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bunnyLibraryId">Video Library ID</Label>
          <Input 
            id="bunnyLibraryId" 
            name="bunnyLibraryId" 
            placeholder="Bunny CDN Library ID" 
            required 
          />
        </div>
        
        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}