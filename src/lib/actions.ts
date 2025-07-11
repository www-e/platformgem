// src/lib/actions.ts
"use server";
import { redirect } from 'next/navigation';
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Grade } from "@prisma/client";
import { auth, signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";

export interface ActionState {
  error?: string;
  success?: string;
}
// --- CORRECTED LOGIN ACTION ---
// The prevState parameter is added back to match the useActionState hook's expectation.
export async function login(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  try {
    await signIn("credentials", formData);
    return { success: "Login successful!" };
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return { error: "معرف الطالب أو رقم الهاتف أو كلمة المرور غير صحيحة." };
    }
    throw error;
  }
}

// --- SIGNUP ACTION ---
export async function signup(prevState: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  const grade = formData.get("grade") as Grade;

  if (!name || !phone || !studentId || !password || !grade) {
    return { error: "يرجى ملء جميع الحقول المطلوبة." };
  }
  if (password.length < 6) return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." };
  if (phone.length < 11) return { error: "رقم الهاتف غير صحيح." };
  
  try {
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ phone }, { studentId }] } });
    if (existingUser) return { error: "يوجد مستخدم بالفعل بهذا الرقم أو معرف الطالب." };
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({ data: { name, phone, parentPhone, studentId, password: hashedPassword, grade } });
  } catch (error) {
    console.error(error);
    return { error: "خطأ في قاعدة البيانات." };
  }
  
  redirect('/login');
}
// --- CREATE COURSE ACTION ---
export async function createCourse(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const targetGrade = formData.get("targetGrade") as Grade;
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;

  if (!title || !description || !thumbnailUrl || !targetGrade || !bunnyLibraryId) {
    return { error: "All fields are required." };
  }

  try {
    await prisma.course.create({ data: { title, description, thumbnailUrl, targetGrade, bunnyLibraryId } });
    revalidatePath("/admin/courses");
    return { success: "Course created successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to create course." };
  }
}
// --- CREATE LESSON ACTION ---
export async function createLesson(courseId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  const order = parseInt(formData.get("order") as string, 10);
  const bunnyVideoId = formData.get("bunnyVideoId") as string;

  if (!title || isNaN(order) || !bunnyVideoId) {
    return { error: "All fields are required and order must be a number." };
  }

  try {
    await prisma.lesson.create({ data: { title, order, bunnyVideoId, courseId: courseId } });
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: "Lesson added successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to create lesson." };
  }
}
// --- ADD EXAM RESULT ACTION ---
export async function addExamResult(userId: string, prevState: ActionState, formData: FormData): Promise<ActionState> {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const score = parseFloat(formData.get("score") as string);

  if (!title || !date || isNaN(score)) {
    return { error: "All fields are required and score must be a number." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { examHistory: true } });
    if (!user) return { error: "User not found." };

    const currentHistory = Array.isArray(user.examHistory) ? user.examHistory : [];
    const newExamResult = { title, date, score };
    const updatedHistory = [...currentHistory, newExamResult];

    await prisma.user.update({ where: { id: userId }, data: { examHistory: updatedHistory } });
    revalidatePath(`/admin/students/${userId}`);
    return { success: "Exam result added successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to add exam result." };
  }
}
// --- ENROLL IN COURSE ACTION ---
export async function enrollInCourse(courseId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to enroll." };
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.user.id, courseId } } });
    if (existingEnrollment) {
      return { error: "You are already enrolled in this course." };
    }
    await prisma.enrollment.create({ data: { userId: session.user.id, courseId } });
    revalidatePath("/dashboard");
    return { success: "Successfully enrolled! The page will now refresh." };
  } catch (error) {
    console.error("Enrollment Error:", error);
    return { error: "Database error: Could not complete enrollment." };
  }
}
// --- TOGGLE LESSON COMPLETION --- (Updated to use ActionState)
export async function toggleLessonComplete(courseId: string, lessonId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.user.id, courseId } }, select: { completedLessonIds: true } });
    if (!enrollment) return { error: "Enrollment not found." };

    const completedIds = new Set(enrollment.completedLessonIds);
    if (completedIds.has(lessonId)) {
      completedIds.delete(lessonId);
    } else {
      completedIds.add(lessonId);
    }
    const updatedCompletedIds = Array.from(completedIds);
    await prisma.enrollment.update({ where: { userId_courseId: { userId: session.user.id, courseId } }, data: { completedLessonIds: updatedCompletedIds } });
    revalidatePath(`/courses/${courseId}`);
    return { success: "Progress updated!" };
  } catch (error) {
    console.error(error);
    return { error: "Database error: could not update progress." };
  }
}