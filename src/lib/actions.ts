// src/lib/actions.ts
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { auth, signIn } from "@/lib/auth";
import prisma from "@/lib/prisma";
// import { isRedirectError } from "next/dist/client/components/redirect-error";

export interface ActionState {
  error?: string;
  success?: string;
}

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

    // Auto-login after successful registration
    const loginFormData = new FormData();
    loginFormData.append("login", phone); // Use phone as primary login
    loginFormData.append("password", password);

    await signIn("credentials", loginFormData);
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

  redirect("/profile");
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

// --- CREATE COURSE ACTION ---
export async function createCourse(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  // Only admins and professors can create courses
  if (!session?.user || !["ADMIN", "PROFESSOR"].includes(session.user.role)) {
    return { error: "غير مصرح لك بإنشاء الدورات." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;
  const price = formData.get("price") as string;

  if (
    !title ||
    !description ||
    !thumbnailUrl ||
    !categoryId ||
    !bunnyLibraryId
  ) {
    return { error: "جميع الحقول مطلوبة." };
  }

  try {
    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return { error: "الفئة المحددة غير موجودة." };
    }

    const coursePrice = price && price !== "0" ? parseFloat(price) : null;

    await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        categoryId,
        professorId: session.user.id,
        bunnyLibraryId,
        price: coursePrice,
        currency: "EGP",
        isPublished: false, // Courses start as drafts
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/professor/courses");
    return { success: "تم إنشاء الدورة بنجاح!" };
  } catch (error) {
    console.error(error);
    return { error: "خطأ في قاعدة البيانات: فشل في إنشاء الدورة." };
  }
}

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

// --- ENROLL IN COURSE ACTION ---
export async function enrollInCourse(courseId: string): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to enroll." };
  }

  try {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (existingEnrollment) {
      return { error: "You are already enrolled in this course." };
    }
    await prisma.enrollment.create({
      data: { userId: session.user.id, courseId },
    });
    revalidatePath("/dashboard");
    return { success: "Successfully enrolled! The page will now refresh." };
  } catch (error) {
    console.error("Enrollment Error:", error);
    return { error: "Database error: Could not complete enrollment." };
  }
}

// --- TOGGLE LESSON COMPLETION ---
export interface ToggleLessonCompleteResult {
  error?: string;
  success?: string;
  nextLessonId?: string | null;
}

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

export async function updateCourse(
  courseId: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "يجب تسجيل الدخول أولاً." };
  }

  // Check if user can edit this course
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return { error: "الدورة غير موجودة." };
  }

  const canEdit =
    session.user.role === "ADMIN" ||
    (session.user.role === "PROFESSOR" &&
      course.professorId === session.user.id);

  if (!canEdit) {
    return { error: "غير مصرح لك بتعديل هذه الدورة." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const thumbnailUrl = formData.get("thumbnailUrl") as string;
  const categoryId = formData.get("categoryId") as string;
  const bunnyLibraryId = formData.get("bunnyLibraryId") as string;
  const price = formData.get("price") as string;

  if (
    !title ||
    !description ||
    !thumbnailUrl ||
    !categoryId ||
    !bunnyLibraryId
  ) {
    return { error: "جميع الحقول مطلوبة." };
  }

  try {
    const coursePrice = price && price !== "0" ? parseFloat(price) : null;

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        thumbnailUrl,
        categoryId,
        bunnyLibraryId,
        price: coursePrice,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/professor/courses");
    return { success: "تم تحديث الدورة بنجاح!" };
  } catch (error) {
    console.error(error);
    return { error: "خطأ في قاعدة البيانات: فشل في تحديث الدورة." };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionState> {
  try {
    await prisma.course.delete({
      where: { id: courseId },
    });
    revalidatePath("/admin/courses");
    return { success: "Course deleted successfully." };
  } catch (error) {
    console.error(error);
    return { error: "Database Error: Failed to delete course." };
  }
}

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