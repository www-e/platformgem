// src/app/courses/[courseId]/_components/completion-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { toggleLessonComplete } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle } from "lucide-react";

function StatusButton({ isCompleted }: { isCompleted: boolean }) {
  const { pending } = useFormStatus();

  const buttonText = isCompleted ? "تم الإكمال" : "وضع علامة كمكتمل";
  const Icon = isCompleted ? CheckCircle : Circle;
  
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      variant={isCompleted ? "secondary" : "default"}
      className="w-full md:w-auto btn-hover-effect"
    >
      {pending ? "جاري التحديث..." : (
        <>
          <Icon className="ml-2 h-5 w-5" />
          {buttonText}
        </>
      )}
    </Button>
  );
}

export function CompletionButton({
  courseId,
  lessonId,
  isCompleted,
}: {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
}) {
  return (
    <form action={async () => {
      const result = await toggleLessonComplete(courseId, lessonId);
      if (result.error) {
        toast.error("فشل التحديث", { description: result.error });
      }
      if (result.success) {
        toast.success("تم تحديث التقدم", { description: result.success });
      }
    }}>
      <StatusButton isCompleted={isCompleted} />
    </form>
  );
}