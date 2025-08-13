// src/app/api/lessons/[id]/materials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const materialSchema = z.object({
  title: z.string().min(1),
  url: z.string().url(),
  type: z.string().optional(),
  size: z.number().optional(),
  uploadedAt: z.string().optional(),
});

const updateMaterialsSchema = z.object({
  materials: z.array(materialSchema),
});

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateMaterialsSchema.parse(body);

    // Verify lesson exists and user has permission to edit
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            professorId: true,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check permissions
    const canEdit =
      session.user.role === "ADMIN" ||
      (session.user.role === "PROFESSOR" &&
        lesson.course.professorId === session.user.id);

    if (!canEdit) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Update lesson materials
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        materials: validatedData.materials,
      },
    });

    return NextResponse.json({
      success: true,
      materials: updatedLesson.materials,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid data format",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error("Update materials error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
