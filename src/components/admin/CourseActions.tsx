// src/components/admin/CourseActions.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Course } from "@prisma/client";
import { deleteCourse } from "@/lib/actions/course.actions";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

// Type for the course data we need
type CourseData = Pick<Course, 'id' | 'title' | 'description' | 'thumbnailUrl' | 'bunnyLibraryId' | 'categoryId' | 'professorId'>;

// Simplified Edit Form component (basic info only)
function EditCourseForm({ course, onFormSuccess }: { course: CourseData, onFormSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show a message that editing should be done through the course management page
    toast.info("Please use the course management page to edit details");
    onFormSuccess();
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Course Title</Label>
        <Input id="title" name="title" defaultValue={course.title} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Course Description</Label>
        <Input id="description" name="description" defaultValue={course.description} disabled />
      </div>
      <div className="text-sm text-muted-foreground">
        To edit course details, please use the course management page.
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onFormSuccess}>Close</Button>
        <Button type="button" asChild>
          <Link href={`/admin/courses/${course.id}`}>Manage Course</Link>
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main component export
export default function CourseActions({ course }: { course: CourseData }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteCourse(course.id);
    if (result.success) {
      toast.success("Deleted successfully!", { description: result.success });
      setIsDeleteDialogOpen(false);
    } else if (result.error) {
      toast.error("Delete failed", { description: result.error });
    }
  };

  return (
    <>
      {/* The Dropdown Menu for actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/courses/${course.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Lessons
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)} 
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
          </DialogHeader>
          <EditCourseForm course={course} onFormSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>This action cannot be undone. This will permanently delete the course and all associated lessons.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>Yes, delete it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}