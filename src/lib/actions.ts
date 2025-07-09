// src/lib/actions.ts

"use server";

import { redirect } from 'next/navigation';
import bcrypt from "bcryptjs";
import { Grade } from "@prisma/client";

import { signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";

// --- LOGIN ACTION ---
// This action handles the login form submission.
export async function login(prevState: string | undefined, formData: FormData) {
  try {
    // We pass the form data to the `signIn` function from Next-Auth.
    // The "credentials" string tells it to use the provider we configured.
    // The redirect is handled automatically by Next-Auth on success.
    await signIn("credentials", formData);
  } catch (error) {
    // Next-Auth throws a specific error type on authentication failure.
    if ((error as Error).message.includes("CredentialsSignin")) {
      return "Invalid student ID, phone number, or password.";
    }
    // For other unexpected errors
    return "An unknown error occurred. Please try again.";
  }
}


// --- SIGN UP ACTION ---
// This action handles the new student registration form.
export async function signup(prevState: string | undefined, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const studentId = formData.get("studentId") as string;
  const password = formData.get("password") as string;
  const grade = formData.get("grade") as Grade;

  // Basic validation
  if (!name || !phone || !studentId || !password || !grade) {
    return "Please fill in all required fields.";
  }

  try {
    // Check if a user already exists with this phone or student ID
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { studentId }],
      },
    });

    if (existingUser) {
      return "A user with this phone number or student ID already exists.";
    }

    // Hash the password for security before storing it.
    // 10 is the "salt round" - a standard value for bcrypt.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user in the database.
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
    console.error(error);
    return "Database error: Failed to create user.";
  }

  // If signup is successful, redirect the user to the login page.
  redirect('/login');
}