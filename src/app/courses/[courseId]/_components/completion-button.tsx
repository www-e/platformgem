// src/app/courses/[courseId]/_components/completion-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { toggleLessonComplete } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

function StatusButton({ isCompleted }: { isCompleted: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending} 
      variant={isCompleted ? "secondary" : "default"}
      className={`w-full md:w-auto transition-colors ${isCompleted ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {pending ? "Updating..." : (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle2 />
          {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
        </div>
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
        toast.error("Update Failed", { description: result.error });
      }
      if (result.success) {
        toast.success("Progress Updated", { description: result.success });
      }
    }}>
      <StatusButton isCompleted={isCompleted} />
    </form>
  );
}