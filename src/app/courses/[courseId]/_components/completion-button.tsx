// src/app/courses/[courseId]/_components/completion-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { toggleLessonComplete } from "@/lib/actions/lesson.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

// The form's action now has a more complex client-side handler
function CompletionForm({
  courseId,
  lessonId,
  isCompleted,
  canMarkComplete,
}: {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  canMarkComplete: boolean;
}) {
  const { pending } = useFormStatus();
  const router = useRouter();

  const handleFormAction = async () => {
    const result = await toggleLessonComplete(courseId, lessonId);
    
    if (result.error) {
      toast.error("فشل التحديث", { description: result.error });
      return;
    }

    if (result.success) {
      if (result.nextLessonId) {
        toast.success("تم بنجاح! جاري نقلك للدرس التالي...");
        router.push(`/courses/${courseId}?lesson=${result.nextLessonId}`);
      } else if (!isCompleted) {
        // Only show "course complete" if we just marked the last lesson as complete
        toast.success("تهانينا! لقد أكملت الدورة بنجاح!");
      } else {
        toast.info("تم تحديث تقدمك.");
      }
    }
  };

  const isDisabled = pending || (!isCompleted && !canMarkComplete);
  const buttonText = isCompleted ? "تم الإكمال" : "وضع علامة كمكتمل";
  const Icon = isCompleted ? CheckCircle : (isDisabled ? Lock : Circle);

  return (
    <form action={handleFormAction}>
      <Button 
        type="submit" 
        disabled={isDisabled}
        variant={isCompleted ? "secondary" : "default"}
        className="w-full md:w-auto btn-hover-effect"
        aria-label={buttonText}
      >
        {pending ? "جاري التحديث..." : (
          <>
            <Icon className="ml-2 h-5 w-5" />
            {buttonText}
          </>
        )}
      </Button>
      {isDisabled && !isCompleted && (
        <p className="text-xs text-muted-foreground text-center md:text-right mt-2">
          يجب مشاهدة الفيديو بالكامل أولاً.
        </p>
      )}
    </form>
  );
}

// The main export is now a simple wrapper
export function CompletionButton(props: {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  canMarkComplete: boolean;
}) {
  return <CompletionForm {...props} />;
}