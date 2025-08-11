// src/app/professor/courses/new/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "@/components/professor/CreateCourseForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function NewCoursePage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'PROFESSOR') {
    redirect('/login');
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/professor/courses">
            <ArrowRight className="w-4 h-4" />
            العودة للدورات
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">إنشاء دورة جديدة</h1>
          <p className="text-muted-foreground">أنشئ دورة تعليمية جديدة وشاركها مع الملتحقين</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات الدورة</CardTitle>
          <CardDescription>
            املأ المعلومات التالية لإنشاء دورتك التعليمية. يمكنك تعديل هذه المعلومات لاحقاً.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateCourseForm />
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">نصائح لإنشاء دورة ناجحة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">العنوان والوصف</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• اختر عنواناً واضحاً ومحدداً</li>
                <li>• اكتب وصفاً شاملاً يوضح محتوى الدورة</li>
                <li>• حدد الأهداف التعليمية بوضوح</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">الصورة والفئة</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• استخدم صورة عالية الجودة وجذابة</li>
                <li>• اختر الفئة المناسبة لدورتك</li>
                <li>• تأكد من أن الصورة تعكس محتوى الدورة</li>
              </ul>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>نصيحة:</strong> ستبدأ دورتك كمسودة غير منشورة. يمكنك إضافة الدروس والمحتوى ثم نشرها عندما تكون جاهزة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}