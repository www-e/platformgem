// src/components/admin/CreateCourseForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { FileUploader } from '@/components/upload/FileUploader';
import { 
  BookOpen, 
  Upload, 
  Save, 
  Eye,
  DollarSign,
  Settings,
  Image as ImageIcon,
  Video,
  Users
} from 'lucide-react';
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

export function CreateCourseForm() {
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchProfessors();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('فشل في تحميل التصنيفات');
    }
  };

  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/users?role=PROFESSOR');
      const data = await response.json();
      setProfessors(data.users || []);
    } catch (error) {
      console.error('Failed to fetch professors:', error);
      toast.error('فشل في تحميل قائمة المدرسين');
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

      const result = await response.json();

      if (response.ok) {
        toast.success('تم إنشاء الدورة بنجاح');
        router.push(`/admin/courses/${result.course.id}`);
      } else {
        toast.error(result.error || 'فشل في إنشاء الدورة');
      }
    } catch (error) {
      console.error('Course creation error:', error);
      toast.error('حدث خطأ في إنشاء الدورة');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'المعلومات الأساسية', icon: BookOpen },
    { number: 2, title: 'إعدادات التدريس', icon: Users },
    { number: 3, title: 'الصورة والمحتوى', icon: ImageIcon },
    { number: 4, title: 'المراجعة والنشر', icon: Eye }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground text-muted-foreground'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="mr-3">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <Progress value={(currentStep / steps.length) * 100} className="mb-6" />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">عنوان الدورة *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="أدخل عنوان الدورة"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description">وصف الدورة *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="اكتب وصفاً مفصلاً للدورة"
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="category">التصنيف *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="اختر تصنيف الدورة" />
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
        )}

        {/* Step 2: Teaching Settings */}
        {currentStep === 2 && (
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
                <Select value={formData.professorId} onValueChange={(value) => handleInputChange('professorId', value)}>
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
                  onChange={(e) => handleInputChange('bunnyLibraryId', e.target.value)}
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
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    اتركه فارغاً للدورات المجانية
                  </p>
                </div>

                <div>
                  <Label htmlFor="currency">العملة</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">جنيه مصري (EGP)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Image and Content */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                الصورة والمحتوى
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>صورة الدورة *</Label>
                <div className="mt-2">
                  <FileUploader
                    onUpload={handleThumbnailUpload}
                    acceptedTypes={['image/*']}
                    maxFileSize={5}
                    maxFiles={1}
                  />
                </div>
                {formData.thumbnailUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.thumbnailUrl}
                      alt="صورة الدورة"
                      className="w-32 h-24 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review and Publish */}
        {currentStep === 4 && (
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
                      <span>التصنيف: {categories.find(c => c.id === formData.categoryId)?.name}</span>
                      <span>المدرس: {professors.find(p => p.id === formData.professorId)?.name}</span>
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
                  onCheckedChange={(checked) => handleInputChange('isPublished', checked)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          السابق
        </Button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              التالي
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}