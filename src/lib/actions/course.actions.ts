// src/lib/actions/course.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionState } from "./types";

// --- CREATE COURSE ACTION ---
export async function createCourse(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  // Only admins and professors can create courses
  if (!session?.user || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return { error: "غير مصرح لك بإنشاء الدورات." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;
  const price = formData.get("price") as string;

  if (
    !title ||
    !description ||
    !thumbnailUrl ||
    !categoryId ||
    !bunnyLibraryId
  ) {
    return { error: "جميع الحقول مطلوبة." };
  }

  try {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return { error: "الفئة المحددة غير موجودة." };
    }

    const coursePrice = price && price !== "0" ? parseFloat(price) : null;

    await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        categoryId,
        professorId: session.user.id,
        bunnyLibraryId,
        price: coursePrice,
        currency: "EGP",
        isPublished: false, // Courses start as drafts
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/professor/courses");
    return { success: "تم إنشاء الدورة بنجاح!" };
  } catch (error) {
    console.error(error);
    return { error: "خطأ في قاعدة البيانات: فشل في إنشاء الدورة." };
  }
}

// --- ENROLL IN COURSE ACTION ---
export async function enrollInCourse(courseId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to enroll." };
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (existingEnrollment) {
      return { error: "You are already enrolled in this course." };
    }
    await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    });
    revalidatePath("/dashboard");
    return { success: "Successfully enrolled! The page will now refresh." };
  } catch (error) {
    console.error("Enrollment Error:", error);
    return { error: "Database error: Could not complete enrollment." };
  }
}

export async function updateCourse(
  courseId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "يجب تسجيل الدخول أولاً." };
  }

  // Check if user can edit this course
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return { error: "الدورة غير موجودة." };
  }

  const canEdit =
    session.user.role === "ADMIN" ||
    (session.user.role === "PROFESSOR" &&
      course.professorId === session.user.id);

  if (!canEdit) {
    return { error: "غير مصرح لك بتعديل هذه الدورة." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;
  const price = formData.get("price") as string;

  if (
    !title ||
    !description ||
    !thumbnailUrl ||
    !categoryId ||
    !bunnyLibraryId
  ) {
    return { error: "جميع الحقول مطلوبة." };
  }

  try {
    const coursePrice = price && price !== "0" ? parseFloat(price) : null;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        thumbnailUrl,
        categoryId,
        bunnyLibraryId,
        price: coursePrice,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/professor/courses");
    return { success: "تم تحديث الدورة بنجاح!" };
  } catch (error) {
    console.error(error);
    return { error: "خطأ في قاعدة البيانات: فشل في تحديث الدورة." };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionState> {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });
    revalidatePath("/admin/courses");
    return { success: "Course deleted successfully." };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to delete course." };
  }
}