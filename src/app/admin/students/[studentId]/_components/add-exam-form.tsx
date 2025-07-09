// src/app/admin/students/[studentId]/_components/add-exam-form.tsx

"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
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
  const [message, dispatch] = useActionState(addExamResultWithUserId, undefined);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader><CardTitle>Add New Exam Result</CardTitle></CardHeader>
      <CardContent>
        <form action={dispatch} className="space-y-4">
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
          {message && <p className="text-sm text-red-400">{message}</p>}
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}