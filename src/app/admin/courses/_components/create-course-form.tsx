// src/app/admin/courses/_components/create-course-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createCourse } from "@/lib/actions";
import { Grade } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={pending}>
      {pending ? "جاري الإنشاء..." : "إنشاء الدورة"}
    </Button>
  );
}

interface CreateCourseFormProps {
  onFormSuccess: () => void;
}

export function CreateCourseForm({ onFormSuccess }: CreateCourseFormProps) {
  const [state, dispatch] = useActionState(createCourse, { error: undefined, success: undefined });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("تم بنجاح!", { description: state.success });
      formRef.current?.reset();
      onFormSuccess(); // Call the function to close the dialog
    }
    if (state?.error) {
      toast.error("خطأ", { description: state.error });
    }
  }, [state, onFormSuccess]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>إنشاء دورة جديدة</DialogTitle>
        <DialogDescription className="pt-1">
          املأ التفاصيل لإضافة دورة جديدة. ستظهر في قائمة الدورات فورًا.
        </DialogDescription>
      </DialogHeader>
      <form ref={formRef} action={dispatch} className="space-y-4 pt-4">
        <div className="space-y-2"><Label htmlFor="title">عنوان الدورة</Label><Input id="title" name="title" placeholder="مثال: الجبر المتقدم" required /></div>
        <div className="space-y-2"><Label htmlFor="description">وصف الدورة</Label><Input id="description" name="description" placeholder="دورة شاملة لـ..." required /></div>
        <div className="space-y-2"><Label htmlFor="thumbnailUrl">رابط الصورة المصغرة</Label><Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://path/to/image.jpg" required /></div>
        <div className="space-y-2"><Label htmlFor="targetGrade">المرحلة الدراسية</Label>
          <Select name="targetGrade" required><SelectTrigger><SelectValue placeholder="اختر المرحلة المستهدفة" /></SelectTrigger>
            <SelectContent><SelectItem value={Grade.FIRST_YEAR}>الصف الأول الثانوي</SelectItem><SelectItem value={Grade.SECOND_YEAR}>الصف الثاني الثانوي</SelectItem><SelectItem value={Grade.THIRD_YEAR}>الصف الثالث الثانوي</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-2"><Label htmlFor="bunnyLibraryId">مكتبة الفيديو</Label>
          <Select name="bunnyLibraryId" required><SelectTrigger><SelectValue placeholder="اختر مكتبة الفيديو" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_SHARH!}>شرح الصف الاول الثانوي</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_SHARH!}>شرح الصف الثاني</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_SHARH!}>شرح الصف الثالث</SelectItem>
              <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_MORA!}>مراجعه الصف الاول</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_MORA!}>مراجعه الصف الثاني</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_MORA!}>مراجعه الصف الثالث</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="pt-4">
            <DialogClose asChild><Button type="button" variant="outline">إلغاء</Button></DialogClose>
            <SubmitButton />
        </DialogFooter>
      </form>
    </>
  );
}