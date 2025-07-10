// src/app/admin/students/[studentId]/_components/add-exam-form.tsx
"use client";

import { useActionState ,useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { addExamResult } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Adding..." : "Add Exam Result"}
    </Button>
  );
}

export function AddExamResultForm({ userId }: { userId: string }) {
  const addExamResultWithUserId = addExamResult.bind(null, userId);
  const [state, dispatch] = useActionState(addExamResultWithUserId, { error: undefined, success: undefined });
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast.error("Error", { description: state.error });
    }
    if (state.success) {
      toast.success("Success!", { description: state.success });
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader><CardTitle>Add New Exam Result</CardTitle></CardHeader>
      <CardContent>
        <form ref={formRef} action={dispatch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Exam Title</Label>
            <Input name="title" id="title" placeholder="e.g., Final Physics Exam" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Exam Date</Label>
            <Input name="date" id="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score</Label>
            <Input name="score" id="score" type="number" step="0.5" placeholder="88.5" required />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}