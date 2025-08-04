// src/components/admin/create-course-form/ReviewPublishStep.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye } from 'lucide-react';
import type { CourseFormData, Category, Professor } from '@/hooks/useCreateCourseForm';

interface ReviewPublishStepProps {
  formData: CourseFormData;
  categories: Category[];
  professors: Professor[];
  onInputChange: (field: keyof CourseFormData, value: string | boolean) => void;
}

export function ReviewPublishStep({ formData, categories, professors, onInputChange }: ReviewPublishStepProps) {
  const selectedCategory = categories.find(c => c.id === formData.categoryId);
  const selectedProfessor = professors.find(p => p.id === formData.professorId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          المراجعة والنشر
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex gap-4">
            {formData.thumbnailUrl && (
              <img
                src={formData.thumbnailUrl}
                alt={formData.title}
                className="w-24 h-18 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{formData.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formData.description}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span>التصنيف: {selectedCategory?.name}</span>
                <span>المدرس: {selectedProfessor?.name}</span>
                {formData.price && (
                  <span className="font-semibold text-primary">
                    {formData.price} {formData.currency}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Publish Settings */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <Label htmlFor="publish">نشر الدورة</Label>
            <p className="text-sm text-muted-foreground">
              هل تريد نشر الدورة فوراً؟
            </p>
          </div>
          <Switch
            id="publish"
            checked={formData.isPublished}
            onCheckedChange={(checked) => onInputChange('isPublished', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}