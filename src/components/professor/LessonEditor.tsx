// src/components/professor/LessonEditor.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MaterialManager } from '@/components/course/MaterialManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Video, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Lesson } from '@prisma/client';

interface LessonEditorProps {
  lesson: Lesson;
  onUpdate: (updatedLesson: Partial<Lesson>) => void;
  onSave: () => void;
}

export function LessonEditor({ lesson, onUpdate, onSave }: LessonEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localLesson, setLocalLesson] = useState(lesson);

  const handleFieldChange = (field: keyof Lesson, value: any) => {
    const updated = { ...localLesson, [field]: value };
    setLocalLesson(updated);
    onUpdate({ [field]: value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave();
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في حفظ التغييرات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialsUpdate = async (materials: any[]) => {
    try {
      const response = await fetch(`/api/lessons/${lesson.id}/materials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ materials }),
      });

      if (!response.ok) {
        throw new Error('Failed to update materials');
      }

      const updatedLesson = { ...localLesson, materials };
      setLocalLesson(updatedLesson);
      onUpdate({ materials });
      
    } catch (error) {
      console.error('Error updating materials:', error);
      toast.error('حدث خطأ في تحديث المواد');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">تحرير الدرس: {lesson.title}</h2>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <Settings className="w-4 h-4 mr-2" />
            الإعدادات الأساسية
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            إعدادات الفيديو
          </TabsTrigger>
          <TabsTrigger value="materials">
            <FileText className="w-4 h-4 mr-2" />
            المواد التعليمية
          </TabsTrigger>
        </TabsList>

        {/* Basic Settings */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان الدرس</Label>
                <Input
                  id="title"
                  value={localLesson.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="أدخل عنوان الدرس"
                />
              </div>

              <div>
                <Label htmlFor="order">ترتيب الدرس</Label>
                <Input
                  id="order"
                  type="number"
                  value={localLesson.order}
                  onChange={(e) => handleFieldChange('order', parseInt(e.target.value))}
                  placeholder="ترتيب الدرس في الدورة"
                />
              </div>

              <div>
                <Label htmlFor="duration">مدة الدرس (بالثواني)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={localLesson.duration || ''}
                  onChange={(e) => handleFieldChange('duration', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="مدة الفيديو بالثواني"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Settings */}
        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الفيديو</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bunnyVideoId">معرف فيديو Bunny.net</Label>
                <Input
                  id="bunnyVideoId"
                  value={localLesson.bunnyVideoId}
                  onChange={(e) => handleFieldChange('bunnyVideoId', e.target.value)}
                  placeholder="معرف الفيديو من Bunny.net"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  يمكنك العثور على معرف الفيديو في لوحة تحكم Bunny.net
                </p>
              </div>

              {/* Video Preview */}
              {localLesson.bunnyVideoId && (
                <div>
                  <Label>معاينة الفيديو</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      معرف الفيديو: {localLesson.bunnyVideoId}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      المدة: {localLesson.duration ? `${Math.floor(localLesson.duration / 60)}:${(localLesson.duration % 60).toString().padStart(2, '0')}` : 'غير محدد'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Materials */}
        <TabsContent value="materials">
          <MaterialManager
            lessonId={lesson.id}
            materials={localLesson.materials}
            onUpdate={handleMaterialsUpdate}
            canEdit={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}