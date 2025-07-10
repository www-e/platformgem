// src/app/admin/courses/[courseId]/_components/add-lesson-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createLesson } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "جاري الإضافة..." : "إضافة درس"}
    </Button>
  );
}

export function AddLessonForm({ courseId }: { courseId: string }) {
  const createLessonWithCourseId = createLesson.bind(null, courseId);
  const [state, dispatch] = useActionState(createLessonWithCourseId, { error: undefined, success: undefined });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast.error("خطأ", { description: state.error });
    }
    if (state.success) {
      toast.success("تم بنجاح!", { description: state.success });
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card className="bg-card">
        <CardHeader>
            <CardTitle>إضافة درس جديد</CardTitle>
        </CardHeader>
        <CardContent>
            <form ref={formRef} action={dispatch} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">عنوان الدرس</Label>
                    <Input name="title" id="title" placeholder="مثال: مقدمة في التفاضل" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="order">ترتيب الدرس</Label>
                    <Input name="order" id="order" type="number" placeholder="1" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bunnyVideoId">معرف الفيديو (Bunny.net)</Label>
                    <Input name="bunnyVideoId" id="bunnyVideoId" placeholder="abc-123-xyz" required />
                </div>
                <SubmitButton />
            </form>
        </CardContent>
    </Card>
  );
}