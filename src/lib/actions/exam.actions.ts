// src/lib/actions/exam.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { ActionState } from "./types";

// --- ADD EXAM RESULT ACTION ---
export async function addExamResult(
  userId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const score = parseFloat(formData.get("score") as string);

  if (!title || !date || isNaN(score)) {
    return { error: "All fields are required and score must be a number." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { examHistory: true },
    });
    if (!user) return { error: "User not found." };

    const currentHistory = Array.isArray(user.examHistory)
      ? user.examHistory
      : [];
    const newExamResult = { title, date, score };
    const updatedHistory = [...currentHistory, newExamResult];

    await prisma.user.update({
      where: { id: userId },
      data: { examHistory: updatedHistory },
    });
    revalidatePath(`/admin/students/${userId}`);
    return { success: "Exam result added successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to add exam result." };
  }
}