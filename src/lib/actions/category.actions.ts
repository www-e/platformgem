// src/lib/actions/category.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionState } from "./types";

// --- CATEGORY MANAGEMENT ACTIONS ---
export async function createCategory(
  prevState: ActionState | undefined,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بإنشاء الفئات." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const iconUrl = formData.get("iconUrl") as string;

  if (!name || !description || !slug) {
    return { error: "الاسم والوصف والرابط المختصر مطلوبة." };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      error:
        "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.",
    };
  }

  try {
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existingCategory) {
      return {
        error:
          existingCategory.name === name
            ? "يوجد فئة بهذا الاسم بالفعل."
            : "يوجد فئة بهذا الرابط المختصر بالفعل.",
      };
    }

    await prisma.category.create({
      data: {
        name,
        description,
        slug,
        iconUrl: iconUrl || null,
        isActive: true,
      },
    });

    revalidatePath("/admin/categories");
    return { success: "تم إنشاء الفئة بنجاح!" };
  } catch (error) {
    console.error("Category creation error:", error);
    return { error: "حدث خطأ في قاعدة البيانات أثناء إنشاء الفئة." };
  }
}

export async function updateCategory(
  categoryId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بتعديل الفئات." };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const slug = formData.get("slug") as string;
  const iconUrl = formData.get("iconUrl") as string;
  const isActive = formData.get("isActive") === "true";

  if (!name || !description || !slug) {
    return { error: "الاسم والوصف والرابط المختصر مطلوبة." };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      error:
        "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.",
    };
  }

  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return { error: "الفئة غير موجودة." };
    }

    const duplicateCategory = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: categoryId } },
          {
            OR: [{ name }, { slug }],
          },
        ],
      },
    });

    if (duplicateCategory) {
      return {
        error:
          duplicateCategory.name === name
            ? "يوجد فئة بهذا الاسم بالفعل."
            : "يوجد فئة بهذا الرابط المختصر بالفعل.",
      };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description,
        slug,
        iconUrl: iconUrl || null,
        isActive,
      },
    });

    revalidatePath("/admin/categories");
    return { success: "تم تحديث الفئة بنجاح!" };
  } catch (error) {
    console.error("Category update error:", error);
    return { error: "حدث خطأ في قاعدة البيانات أثناء تحديث الفئة." };
  }
}

export async function deleteCategory(categoryId: string): Promise<ActionState> {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بحذف الفئات." };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    if (!category) {
      return { error: "الفئة غير موجودة." };
    }

    if (category._count.courses > 0) {
      return {
        error: `لا يمكن حذف الفئة لأنها تحتوي على ${category._count.courses} دورة. يجب حذف أو نقل الدورات أولاً.`,
      };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/categories");
    return { success: "تم حذف الفئة بنجاح!" };
  } catch (error) {
    console.error("Category deletion error:", error);
    return { error: "حدث خطأ في قاعدة البيانات أثناء حذف الفئة." };
  }
}