// src/components/admin/CourseActions.tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { useState, useActionState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Course, Grade } from "@prisma/client";
import { ActionState, deleteCourse, updateCourse } from "@/lib/actions";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Type for the course data we need
type CourseData = Pick<Course, 'id' | 'title' | 'description' | 'thumbnailUrl' | 'targetGrade' | 'bunnyLibraryId'>;

// Reusable Edit Form component
function EditCourseForm({ course, onFormSuccess }: { course: CourseData, onFormSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const updateCourseWithId = updateCourse.bind(null, course.id);
  const [state, dispatch] = useActionState(updateCourse, { error: undefined, success: undefined });

  useEffect(() => {
    if (state.success) {
      toast.success("تم التحديث بنجاح!", { description: state.success });
      onFormSuccess(); // Close the dialog on success
    }
    if (state.error) {
      toast.error("فشل التحديث", { description: state.error });
    }
  }, [state, onFormSuccess]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4 mt-4">
      {/* All form fields are pre-filled with the course data */}
      <div className="space-y-2"><Label htmlFor="title">عنوان الدورة</Label><Input id="title" name="title" defaultValue={course.title} required /></div>
      <div className="space-y-2"><Label htmlFor="description">وصف الدورة</Label><Input id="description" name="description" defaultValue={course.description} required /></div>
      <div className="space-y-2"><Label htmlFor="thumbnailUrl">رابط الصورة المصغرة</Label><Input id="thumbnailUrl" name="thumbnailUrl" defaultValue={course.thumbnailUrl} required /></div>
      <div className="space-y-2"><Label htmlFor="targetGrade">المرحلة الدراسية</Label>
        <Select name="targetGrade" required defaultValue={course.targetGrade}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value={Grade.FIRST_YEAR}>الصف الأول الثانوي</SelectItem><SelectItem value={Grade.SECOND_YEAR}>الصف الثاني الثانوي</SelectItem><SelectItem value={Grade.THIRD_YEAR}>الصف الثالث الثانوي</SelectItem></SelectContent>
        </Select>
      </div>
      <div className="space-y-2"><Label htmlFor="bunnyLibraryId">مكتبة الفيديو</Label>
        <Select name="bunnyLibraryId" required defaultValue={course.bunnyLibraryId}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_SHARH!}>شرح الصف الاول</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_SHARH!}>شرح الصف الثاني</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_SHARH!}>شرح الصف الثالث</SelectItem>
            <SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G1_MORA!}>مراجعه الصف الاول</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G2_MORA!}>مراجعه الصف الثاني</SelectItem><SelectItem value={process.env.NEXT_PUBLIC_BUNNY_LIB_G3_MORA!}>مراجعه الصف الثالث</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter><Button type="submit">حفظ التغييرات</Button></DialogFooter>
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
      toast.success("تم الحذف بنجاح!", { description: result.success });
      setIsDeleteDialogOpen(false);
    } else if (result.error) {
      toast.error("فشل الحذف", { description: result.error });
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
          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
          <DropdownMenuItem asChild><Link href={`/admin/courses/${course.id}`}><ExternalLink className="mr-2 h-4 w-4" />إدارة الدروس</Link></DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}><Edit className="mr-2 h-4 w-4" />تعديل</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive"><Trash className="mr-2 h-4 w-4" />حذف</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>تعديل بيانات الدورة</DialogTitle></DialogHeader>
          <EditCourseForm course={course} onFormSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>هل أنت متأكد تماماً؟</DialogTitle>
            <DialogDescription>هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الدورة وجميع الدروس المرتبطة بها بشكل دائم.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete}>نعم، قم بالحذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}