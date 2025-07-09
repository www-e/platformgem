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
