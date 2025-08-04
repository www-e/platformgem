// src/components/admin/create-course-form/TeachingSettingsStep.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { CURRENCY_OPTIONS } from '@/lib/course-form-utils';
import type { CourseFormData, Professor } from '@/hooks/useCreateCourseForm';

interface TeachingSettingsStepProps {
  formData: CourseFormData;
  professors: Professor[];
  onInputChange: (field: keyof CourseFormData, value: string | boolean) => void;
}

export function TeachingSettingsStep({ formData, professors, onInputChange }: TeachingSettingsStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          إعدادات التدريس
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="professor">المدرس *</Label>
          <Select value={formData.professorId} onValueChange={(value) => onInputChange('professorId', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="اختر المدرس" />
            </SelectTrigger>
            <SelectContent>
              {professors.map((professor) => (
                <SelectItem key={professor.id} value={professor.id}>
                  {professor.name} ({professor.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bunnyLibraryId">معرف مكتبة Bunny.net *</Label>
          <Input
            id="bunnyLibraryId"
            value={formData.bunnyLibraryId}
            onChange={(e) => onInputChange('bunnyLibraryId', e.target.value)}
            placeholder="أدخل معرف مكتبة الفيديو"
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            يمكنك العثور على معرف المكتبة في لوحة تحكم Bunny.net
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">سعر الدورة</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => onInputChange('price', e.target.value)}
              placeholder="0"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              اتركه فارغاً للدورات المجانية
            </p>
          </div>

          <div>
            <Label htmlFor="currency">العملة</Label>
            <Select value={formData.currency} onValueChange={(value) => onInputChange('currency', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}