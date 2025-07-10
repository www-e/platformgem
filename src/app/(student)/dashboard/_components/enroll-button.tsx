// src/app/(student)/dashboard/_components/enroll-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { enrollInCourse } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

function SubmitContent() {
    const { pending } = useFormStatus();
    return (
        <>
            {pending ? (
                <>
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    <span>جاري التسجيل...</span>
                </>
            ) : (
                <>
                    <PlusCircle className="ml-2 h-5 w-5" />
                    <span>سجل الآن</span>
                </>
            )}
        </>
    )
}

export function EnrollButton({ courseId }: { courseId: string }) {
  return (
    <form action={async () => {
        await enrollInCourse(courseId)
    }} className="w-full">
      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground btn-hover-effect">
        <SubmitContent />
      </Button>
    </form>
  );
}