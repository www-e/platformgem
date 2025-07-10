// src/app/courses/[courseId]/_components/completion-button.tsx
"use client";

import { useFormStatus } from "react-dom";
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
            className={`w-full md:w-auto ${isCompleted ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
            {pending ? "Updating..." : (
                <div className="flex items-center gap-2">
                    <CheckCircle2 />
                    {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                </div>
            )}
        </Button>
    )
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
        await toggleLessonComplete(courseId, lessonId);
    }}>
      <StatusButton isCompleted={isCompleted} />
    </form>
  );
}