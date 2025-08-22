// src/components/admin/create-course-form/ImageContentStep.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileUploader, type UploadedFile } from '@/components/upload/FileUploader';
import { Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { CourseFormData } from '@/hooks/useCreateCourseForm';

interface ImageContentStepProps {
  formData: CourseFormData;
  onThumbnailUpload: (files: UploadedFile[]) => void;
}

export function ImageContentStep({ formData, onThumbnailUpload }: ImageContentStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Image & Content
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Course Image *</Label>
          <div className="mt-2">
            <FileUploader
              onUpload={onThumbnailUpload}
              acceptedTypes={['image/*']}
              maxFileSize={5}
              maxFiles={1}
            />
          </div>
          {formData.thumbnailUrl && (
            <div className="mt-4">
              <Image
                src={formData.thumbnailUrl}
                alt="Course Image"
                width={128}
                height={96}
                className="w-32 h-24 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}