// src/components/admin/create-course-form/BasicInfoStep.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen } from 'lucide-react';
import type { CourseFormData, Category } from '@/hooks/useCreateCourseForm';

interface BasicInfoStepProps {
  formData: CourseFormData;
  categories: Category[];
  onInputChange: (field: keyof CourseFormData, value: string | boolean) => void;
}

export function BasicInfoStep({ formData, categories, onInputChange }: BasicInfoStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            placeholder="Enter course title"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description">Course Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Write a detailed description of the course"
            rows={4}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.categoryId} onValueChange={(value: string) => onInputChange('categoryId', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select course category" />
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
      </CardContent>
    </Card>
  );
}