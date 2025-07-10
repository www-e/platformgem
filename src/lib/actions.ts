// src/lib/actions.ts
"use server";

import { redirect } from 'next/navigation';
import bcrypt from "bcryptjs";
import { Grade } from "@prisma/client";
import { auth, signIn } from "@/lib/auth";
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
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;

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
        bunnyLibraryId,
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
  prevState: { error?: string }, // The previous state is now an object
  formData: FormData
): Promise<{ error?: string }> { // This function PROMISES to return an object with an error string
  const title = formData.get("title") as string;
  const order = parseInt(formData.get("order") as string, 10);
  const bunnyVideoId = formData.get("bunnyVideoId") as string;

  if (!title || isNaN(order) || !bunnyVideoId) {
    return { error:"All fields are required and order must be a number."};
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
    return { success: "Lesson added successfully!" }; // Clear error message on success
    
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to create lesson."};
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
    return { success: "Exam result added successfully!" }; // Success
    
  } catch (error) {
    console.error(error);
    return "Database Error: Failed to add exam result.";
  }
}
// --- ENROLL IN COURSE ACTION ---
export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to enroll." };
  }

  try {
    // Check if enrollment already exists to prevent duplicates
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return { message: "You are already enrolled in this course." };
    }

    // Create the new enrollment record
    await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        // progressPercent and completedLessonIds will use their default values
      },
    });

    // Revalidate the dashboard path so the UI updates to show "View Course"
    revalidatePath("/dashboard");
    return { message: "Successfully enrolled!" };

  } catch (error) {
    console.error("Enrollment Error:", error);
    return { error: "Database error: Could not complete enrollment." };
  }
}
// --- TOGGLE LESSON COMPLETION ---
export async function toggleLessonComplete(
  courseId: string,
  lessonId: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }
  const userId = session.user.id;

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      select: {
        completedLessonIds: true,
      },
    });

    if (!enrollment) {
      return { error: "Enrollment not found." };
    }

    const completedIds = new Set(enrollment.completedLessonIds);

    // Toggle the lesson's completion status
    if (completedIds.has(lessonId)) {
      completedIds.delete(lessonId);
    } else {
      completedIds.add(lessonId);
    }
    
    // Convert the Set back to an array to store in the database
    const updatedCompletedIds = Array.from(completedIds);

    await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        completedLessonIds: updatedCompletedIds,
      },
    });

    // Revalidate the course player page to instantly update the sidebar UI
    revalidatePath(`/courses/${courseId}`);
    return { success: "Progress updated!" };

  } catch (error) {
    console.error(error);
    return { error: "Database error: could not update progress." };
  }
}