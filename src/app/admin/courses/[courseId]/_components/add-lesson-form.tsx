// src/app/admin/courses/[courseId]/_components/add-lesson-form.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
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
  // Bind the courseId to the server action
  const createLessonWithCourseId = createLesson.bind(null, courseId);
  
  // Initialize the state and dispatch function
  const [state, dispatch] = useActionState(createLessonWithCourseId, { error: undefined, success: undefined });
  
  // A ref to the form element to reset it on success
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error });
    }
    if (state.success) {
      toast.success("Success!", { description: state.success });
      formRef.current?.reset(); // Reset the form on success
    }
  }, [state]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
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
      <SubmitButton />
    </form>
  );
}