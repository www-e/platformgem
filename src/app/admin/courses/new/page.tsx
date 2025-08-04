// src/app/admin/courses/new/page.tsx
import { CreateCourseForm } from '@/components/admin/CreateCourseForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/courses">
            <ArrowRight className="h-4 w-4 mr-2" />
            العودة للدورات
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">إنشاء دورة جديدة</h1>
          <p className="text-muted-foreground">
            أضف دورة تعليمية جديدة للمنصة
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الدورة</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCourseForm />
        </CardContent>
      </Card>
    </div>
  );
}