// src/lib/actions/lesson.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionState, ToggleLessonCompleteResult } from "./types";

// --- CREATE LESSON ACTION ---
export async function createLesson(
  courseId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = formData.get("title") as string;
  const order = parseInt(formData.get("order") as string, 10);
  const bunnyVideoId = formData.get("bunnyVideoId") as string;

  if (!title || isNaN(order) || !bunnyVideoId) {
    return { error: "All fields are required and order must be a number." };
  }

  try {
    await prisma.lesson.create({
      data: { title, order, bunnyVideoId, courseId: courseId },
    });
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: "Lesson added successfully!" };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to create lesson." };
  }
}

// --- TOGGLE LESSON COMPLETION ---
export async function toggleLessonComplete(
  courseId: string,
  lessonId: string
): Promise<ToggleLessonCompleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  try {
    const courseWithLessons = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: { orderBy: { order: "asc" } } },
    });

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      select: { completedLessonIds: true },
    });

    if (!enrollment || !courseWithLessons) {
      return { error: "Enrollment not found." };
    }

    const completedIds = new Set(enrollment.completedLessonIds);
    let nextLessonId: string | null = null;

    if (completedIds.has(lessonId)) {
      completedIds.delete(lessonId);
    } else {
      completedIds.add(lessonId);

      const currentLessonIndex = courseWithLessons.lessons.findIndex(
        (l) => l.id === lessonId
      );
      const isLastLesson =
        currentLessonIndex === courseWithLessons.lessons.length - 1;

      if (!isLastLesson) {
        nextLessonId = courseWithLessons.lessons[currentLessonIndex + 1].id;
      }
    }

    const updatedCompletedIds = Array.from(completedIds);

    await prisma.enrollment.update({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      data: { completedLessonIds: updatedCompletedIds },
    });

    revalidatePath(`/courses/${courseId}`);

    return {
      success: "Progress updated!",
      nextLessonId: nextLessonId,
    };
  } catch (error) {
    console.error(error);
    return { error: "Database error: could not update progress." };
  }
}