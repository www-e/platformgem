// src/lib/actions.ts
"use server";

import { redirect } from 'next/navigation';
import bcrypt from "bcryptjs";
import { Grade } from "@prisma/client";
import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";

// --- LOGIN ACTION ---
export async function login(prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return "معرف الطالب أو رقم الهاتف أو كلمة المرور غير صحيحة.";
    }
    return "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
  }
  
  // Only redirect if signIn succeeded (no error thrown)
  redirect("/profile");
}

// --- SIGNUP ACTION ---
export async function signup(prevState: string | undefined, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  const grade = formData.get("grade") as Grade;

  // Enhanced validation
  if (!name || !phone || !studentId || !password || !grade) {
    return "يرجى ملء جميع الحقول المطلوبة.";
  }

  if (password.length < 6) {
    return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
  }

  if (phone.length < 11) {
    return "رقم الهاتف غير صحيح.";
  }

  // Check for existing user BEFORE try/catch
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { studentId }],
      },
    });

    if (existingUser) {
      return "يوجد مستخدم بالفعل بهذا الرقم أو معرف الطالب.";
    }
  } catch (error) {
    console.error("Database check error:", error);
    return "خطأ في الاتصال بقاعدة البيانات.";
  }

  // Create user in separate try/catch
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        phone,
        parentPhone,
        studentId,
        password: hashedPassword,
        grade,
      },
    });
  } catch (error) {
    console.error("User creation error:", error);
    return "خطأ في قاعدة البيانات: فشل في إنشاء الحساب.";
  }

  // Only redirect if user creation succeeded
  redirect('/login');
}
// Add this new function to src/lib/actions.ts

import { revalidatePath } from "next/cache";

// --- CREATE COURSE ACTION ---
export async function createCourse(prevState: string | undefined, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const targetGrade = formData.get("targetGrade") as Grade;

  if (!title || !description || !thumbnailUrl || !targetGrade) {
    return "All fields are required.";
  }

  try {
    await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        targetGrade,
      },
    });

    // This is a crucial Next.js feature. It tells Next.js to refresh the
    // data for the admin courses page, so the new course appears in the
    // list immediately after creation without a manual page refresh.
    revalidatePath("/admin/courses");
    
    return "Course created successfully!"; // This is a success message

  } catch (error) {
    console.error(error);
    return "Database Error: Failed to create course.";
  }
}
// --- CREATE LESSON ACTION ---
export async function createLesson(
  courseId: string, 
  prevState: string | undefined, 
  formData: FormData
) {
  const title = formData.get("title") as string;
  const order = parseInt(formData.get("order") as string, 10);
  const bunnyVideoId = formData.get("bunnyVideoId") as string;

  if (!title || isNaN(order) || !bunnyVideoId) {
    return "All fields are required and order must be a number.";
  }

  try {
    await prisma.lesson.create({
      data: {
        title,
        order,
        bunnyVideoId,
        courseId: courseId,
      },
    });

    revalidatePath(`/admin/courses/${courseId}`);
    return undefined; // Clear error message on success
    
  } catch (error) {
    console.error(error);
    return "Database Error: Failed to create lesson.";
  }
}
// --- ADD EXAM RESULT ACTION ---
export async function addExamResult(
  userId: string,
  prevState: string | undefined,
  formData: FormData
) {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const score = parseFloat(formData.get("score") as string);

  if (!title || !date || isNaN(score)) {
    return "All fields are required and score must be a number.";
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examHistory: true },
    });

    if (!user) {
      return "User not found.";
    }

    const currentHistory = Array.isArray(user.examHistory) ? user.examHistory : [];
    
    const newExamResult = { title, date, score };
    
    const updatedHistory = [...currentHistory, newExamResult];

    await prisma.user.update({
      where: { id: userId },
      data: {
        examHistory: updatedHistory,
      },
    });

    revalidatePath(`/admin/students/${userId}`);
    return undefined; // Success
    
  } catch (error) {
    console.error(error);
    return "Database Error: Failed to add exam result.";
  }
}