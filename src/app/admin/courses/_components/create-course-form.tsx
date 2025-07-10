// src/app/admin/courses/_components/create-course-form.tsx

"use client";
import React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCourse } from "@/lib/actions";
import { Grade } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={pending}>
      {pending ? "Creating Course..." : "Create Course"}
    </Button>
  );
}

export function CreateCourseForm() {
  const [message, dispatch] = useActionState(createCourse, undefined);

  // This is a simple effect to clear the form on success
  // In a real app, you might use a form library for more robust state management
  React.useEffect(() => {
    if (message) {
      if (message.includes("success")) {
        toast.success("Success!", { description: message });
        (document.getElementById('create-course-form') as HTMLFormElement)?.reset();
      } else {
        toast.error("Error", { description: message });
      }
    }
  }, [message]);

  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader>
        <CardTitle>Create New Course</CardTitle>
        <CardDescription className="text-gray-400">Fill out the details to add a new course.</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="create-course-form" action={dispatch} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input id="title" name="title" placeholder="e.g., Advanced Algebra" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Course Description</Label>
            <Input id="description" name="description" placeholder="A comprehensive course..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://path/to/image.jpg" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetGrade">Target Grade</Label>
            <Select name="targetGrade" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select target grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Grade.FIRST_YEAR}>الصف الأول الثانوي</SelectItem>
                <SelectItem value={Grade.SECOND_YEAR}>الصف الثاني الثانوي</SelectItem>
                <SelectItem value={Grade.THIRD_YEAR}>الصف الثالث الثانوي</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* ADD THIS NEW BLOCK FOR BUNNY LIBRARY SELECTION */}
          <div className="space-y-2">
            <Label htmlFor="bunnyLibraryId">Video Library</Label>
            <Select name="bunnyLibraryId" required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select video library" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_SHARH!}>شرح الصف الاول الثانوي</SelectItem>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_SHARH!}>شرح الصف الثاني</SelectItem>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_SHARH!}>شرح الصف الثالث</SelectItem>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_MORA!}>مراجعه الصف الاول</SelectItem>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_MORA!}>مراجعه الصف الثاني</SelectItem>
                <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_MORA!}>مراجعه الصف الثالث</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}