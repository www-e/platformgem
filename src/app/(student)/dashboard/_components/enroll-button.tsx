// src/app/(student)/dashboard/_components/enroll-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { enrollInCourse } from "@/lib/actions";
import { Button } from "@/components/ui/button";

function SubmitContent() {
    const { pending } = useFormStatus();
    return (
        <>
        {pending ? "جاري التسجيل..." : "سجل الآن"}
        </>
    )
}

export function EnrollButton({ courseId }: { courseId: string }) {
  // We use a form with a server action to handle the enrollment
  return (
    <form action={async () => {
        await enrollInCourse(courseId)
    }} className="w-full">
      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
        <SubmitContent />
      </Button>
    </form>
  );
}