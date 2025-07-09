// src/app/admin/courses/[courseId]/_components/add-lesson-form.tsx

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createLesson } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Adding Lesson..." : "Add Lesson"}
    </Button>
  );
}

export function AddLessonForm({ courseId }: { courseId: string }) {
  const createLessonWithCourseId = createLesson.bind(null, courseId);
  const [message, dispatch] = useActionState(createLessonWithCourseId, undefined);

  return (
    <form action={dispatch} className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
      <h2 className="text-2xl font-bold">Add New Lesson</h2>
      <div className="space-y-2">
        <Label htmlFor="title">Lesson Title</Label>
        <Input name="title" id="title" placeholder="e.g., Introduction to Calculus" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="order">Lesson Order</Label>
        <Input name="order" id="order" type="number" placeholder="1" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bunnyVideoId">Bunny.net Video ID</Label>
        <Input name="bunnyVideoId" id="bunnyVideoId" placeholder="abc-123-xyz" required />
      </div>
      {message && <p className="text-sm text-red-400">{message}</p>}
      <SubmitButton />
    </form>
  );
}