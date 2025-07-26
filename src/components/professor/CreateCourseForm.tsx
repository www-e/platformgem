// src/components/professor/CreateCourseForm.tsx
"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createCourse } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySelector } from "@/components/admin/CategorySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Image, DollarSign, Video } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          جاري إنشاء الدورة...
        </>
      ) : (
        <>
          <BookOpen className="w-5 h-5" />
          إنشاء الدورة
        </>
      )}
    </Button>
  );
}

export function CreateCourseForm() {
  const router = useRouter();
  const [state, dispatch] = useActionState(createCourse, undefined);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isPaid, setIsPaid] = useState(false);

  // Redirect on success
  if (state?.success) {
    router.push('/professor/courses');
  }

  return (
    <form action={dispatch} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-title">عنوان الدورة</Label>
          <Input 
            id="course-title" 
            name="title" 
            placeholder="مثال: أساسيات التربية البدنية للمبتدئين" 
            required 
            className="h-12 text-lg" 
          />
          <p className="text-sm text-muted-foreground">
            اختر عنواناً واضحاً وجذاباً يصف محتوى دورتك
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-description">وصف الدورة</Label>
          <Textarea 
            id="course-description" 
            name="description" 
            placeholder="اكتب وصفاً شاملاً عن محتوى الدورة، الأهداف التعليمية، والمهارات التي سيكتسبها الطلاب..." 
            required
            className="min-h-[120px]" 
          />
          <p className="text-sm text-muted-foreground">
            وصف مفصل يساعد الطلاب على فهم ما ستقدمه الدورة
          </p>
        </div>
      </div>

      {/* Category and Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>فئة الدورة</Label>
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            placeholder="اختر فئة الدورة"
            required
            name="categoryId"
          />
          <p className="text-sm text-muted-foreground">
            اختر الفئة التي تناسب محتوى دورتك
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-thumbnail">رابط الصورة المصغرة</Label>
          <div className="relative">
            <Input 
              id="course-thumbnail" 
              name="thumbnailUrl" 
              type="url"
              placeholder="https://example.com/image.jpg" 
              required 
              className="h-12 pl-12" 
              dir="ltr"
            />
            <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            رابط صورة عالية الجودة تمثل محتوى الدورة
          </p>
        </div>
      </div>

      {/* Technical Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5" />
            إعدادات الفيديو
          </CardTitle>
          <CardDescription>
            معلومات تقنية خاصة بمنصة Bunny CDN لاستضافة الفيديوهات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bunny-library">معرف مكتبة Bunny</Label>
            <Input 
              id="bunny-library" 
              name="bunnyLibraryId" 
              placeholder="مثال: 12345" 
              required 
              className="h-12" 
              dir="ltr"
            />
            <p className="text-sm text-muted-foreground">
              معرف المكتبة في Bunny CDN حيث ستُرفع فيديوهات الدورة
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            تسعير الدورة
          </CardTitle>
          <CardDescription>
            حدد ما إذا كانت الدورة مجانية أم مدفوعة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Switch
              id="is-paid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
            <Label htmlFor="is-paid">دورة مدفوعة</Label>
          </div>

          {isPaid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course-price">سعر الدورة</Label>
                <div className="relative">
                  <Input 
                    id="course-price" 
                    name="price" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="100.00" 
                    className="h-12 pr-12" 
                    dir="ltr"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    ج.م
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course-currency">العملة</Label>
                <Input 
                  id="course-currency" 
                  name="currency" 
                  value="EGP"
                  readOnly
                  className="h-12 bg-muted" 
                  dir="ltr"
                />
              </div>
            </div>
          )}

          {!isPaid && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ ستكون هذه الدورة مجانية ومتاحة لجميع الطلاب
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {state?.error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground px-4 py-3 rounded-md">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-md">
          {state.success}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-6 border-t">
        <SubmitButton />
        <p className="text-sm text-muted-foreground text-center mt-3">
          ستُنشأ الدورة كمسودة غير منشورة. يمكنك إضافة الدروس ثم نشرها لاحقاً.
        </p>
      </div>
    </form>
  );
}