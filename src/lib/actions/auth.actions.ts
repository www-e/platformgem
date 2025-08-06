// src/lib/actions/auth.actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionState } from "./types";

// --- STUDENT SIGNUP ACTION ---
export async function signupStudent(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !password) {
    return { error: "يرجى ملء جميع الحقول المطلوبة." };
  }
  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل." };
  }
  if (phone.length < 11) {
    return { error: "رقم الهاتف غير صحيح." };
  }

  try {
    // Check for existing user by phone, email, or studentId
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : []),
          ...(studentId ? [{ studentId }] : []),
        ],
      },
    });

    if (existingUser) {
      return {
        error:
          "يوجد مستخدم بالفعل بهذا الرقم أو البريد الإلكتروني أو معرف الطالب.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        parentPhone: parentPhone || null,
        studentId: studentId || null,
        password: hashedPassword,
        role: "STUDENT",
        isActive: true,
      },
    });

    // Note: Auto-login after registration is disabled for now
    // User will need to login manually after signup
  } catch (error) {
    // Handle redirect errors by re-throwing them
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Student signup error:", error);
    if ((error as Error).message.includes("CredentialsSignin")) {
      return {
        error: "فشل تسجيل الدخول التلقائي. يرجى محاولة تسجيل الدخول يدويًا.",
      };
    }
    return { error: "حدث خطأ في قاعدة البيانات أثناء إنشاء الحساب." };
  }

  // Redirect to login page after successful signup
  redirect("/login?message=تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.");
}

// --- PROFESSOR SIGNUP ACTION (Admin only) ---
export async function createProfessor(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  // Only admins can create professor accounts
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإنشاء حسابات الأساتذة." };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const bio = formData.get("bio") as string;
  const expertise = formData.get("expertise") as string;
  const password = formData.get("password") as string;

  if (!name || !phone || !password) {
    return { error: "الاسم ورقم الهاتف وكلمة المرور مطلوبة." };
  }

  if (password.length < 8) {
    return { error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل للأساتذة." };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });

    if (existingUser) {
      return { error: "يوجد مستخدم بالفعل بهذا الرقم أو البريد الإلكتروني." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const expertiseArray = expertise
      ? expertise
          .split(",")
          .map((e) => e.trim())
          .filter((e) => e)
      : [];

    await prisma.user.create({
      data: {
        name,
        phone,
        email: email || null,
        bio: bio || null,
        expertise: expertiseArray,
        password: hashedPassword,
        role: "PROFESSOR",
        isActive: true,
      },
    });

    revalidatePath("/admin/professors");
    return { success: "تم إنشاء حساب الأستاذ بنجاح!" };
  } catch (error) {
    console.error("Professor creation error:", error);
    return { error: "حدث خطأ في قاعدة البيانات أثناء إنشاء حساب الأستاذ." };
  }
}

// Legacy signup function for backward compatibility
export async function signup(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  return signupStudent(prevState, formData);
}