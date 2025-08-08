// src/app/api/courses/[id]/route.ts
import { NextRequest} from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

// Validation schema for course update
const courseUpdateSchema = z.object({
  title: z.string().min(1, 'عنوان الدورة مطلوب').max(200, 'عنوان الدورة طويل جداً').optional(),
  description: z.string().min(1, 'وصف الدورة مطلوب').max(2000, 'وصف الدورة طويل جداً').optional(),
  thumbnailUrl: z.string().url('رابط الصورة المصغرة غير صحيح').optional(),
  categoryId: z.string().min(1, 'فئة الدورة مطلوبة').optional(),
  bunnyLibraryId: z.string().min(1, 'معرف مكتبة Bunny مطلوب').optional(),
  price: z.number().min(0, 'السعر لا يمكن أن يكون سالباً').nullable().optional(),
  currency: z.string().optional(),
  isPublished: z.boolean().optional()
});

interface RouteParams {
  params: { id: string }
}

// GET /api/courses/[id] - Get single course with details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true';

    // Build where clause based on user permissions
    const whereClause: any = { id };
    
    // Only show unpublished courses to the owner or admin
    if (!includeUnpublished) {
      whereClause.isPublished = true;
    } else if (session?.user) {
      // Allow unpublished courses only for the professor who owns it or admin
      if (session.user.role !== 'ADMIN') {
        whereClause.OR = [
          { isPublished: true },
          { professorId: session.user.id }
        ];
      }
    } else {
      whereClause.isPublished = true;
    }

    const course = await prisma.course.findFirst({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        },
        professor: {
          select: {
            id: true,
            name: true,
            bio: true,
            expertise: true
          }
        },
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            order: true,
            duration: true,
            bunnyVideoId: true,
            materials: true
          }
        },
        enrollments: session?.user ? {
          where: { userId: session.user.id },
          select: {
            id: true,
            enrolledAt: true,
            progressPercent: true,
            completedLessonIds: true,
            totalWatchTime: true,
            lastAccessedAt: true
          }
        } : false,
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      }
    });

    if (!course) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'الدورة غير موجودة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Add user-specific data
    const courseWithUserData = {
      ...course,
      isEnrolled: session?.user ? course.enrollments.length > 0 : false,
      userProgress: session?.user && course.enrollments.length > 0 ? course.enrollments[0] : null,
      canEdit: session?.user ? (
        session.user.role === 'ADMIN' || 
        (session.user.role === 'PROFESSOR' && course.professorId === session.user.id)
      ) : false
    };

    // Remove enrollments array from response (we have isEnrolled and userProgress instead)
    delete (courseWithUserData as any).enrollments;

    return createSuccessResponse(courseWithUserData);

  } catch (error) {
    console.error('Course GET error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// PUT /api/courses/[id] - Update course (Owner/Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id } = await params;

    // Check if course exists and user can edit it
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        professorId: true,
        title: true,
        isPublished: true
      }
    });

    if (!existingCourse) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'الدورة غير موجودة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check permissions
    const canEdit = session.user.role === 'ADMIN' || 
                   (session.user.role === 'PROFESSOR' && existingCourse.professorId === session.user.id);

    if (!canEdit) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بتعديل هذه الدورة',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = courseUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        ApiErrors.VALIDATION_ERROR.message,
        ApiErrors.VALIDATION_ERROR.status,
        validationResult.error.issues
      );
    }

    const updateData = validationResult.data;

    // If updating category, verify it exists and is active
    if (updateData.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: updateData.categoryId, isActive: true }
      });

      if (!category) {
        return createErrorResponse(
          'INVALID_CATEGORY',
          'الفئة المحددة غير موجودة أو غير نشطة',
          400
        );
      }
    }

    // If updating title, check for duplicates by the same professor
    if (updateData.title && updateData.title !== existingCourse.title) {
      const duplicateCourse = await prisma.course.findFirst({
        where: {
          title: updateData.title,
          professorId: existingCourse.professorId,
          id: { not: id }
        }
      });

      if (duplicateCourse) {
        return createErrorResponse(
          ApiErrors.DUPLICATE_ERROR.code,
          'لديك دورة بهذا العنوان بالفعل',
          ApiErrors.DUPLICATE_ERROR.status
        );
      }
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        professor: {
          select: {
            id: true,
            name: true,
            bio: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      }
    });

    return createSuccessResponse(updatedCourse);

  } catch (error) {
    console.error('Course PUT error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// DELETE /api/courses/[id] - Delete course (Owner/Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { id } = await params;

    // Check if course exists and user can delete it
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      }
    });

    if (!existingCourse) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'الدورة غير موجودة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check permissions
    const canDelete = session.user.role === 'ADMIN' || 
                     (session.user.role === 'PROFESSOR' && existingCourse.professorId === session.user.id);

    if (!canDelete) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بحذف هذه الدورة',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Check if course has enrollments (optional protection)
    if (existingCourse._count.enrollments > 0) {
      return createErrorResponse(
        'CONSTRAINT_ERROR',
        `لا يمكن حذف الدورة لأنها تحتوي على ${existingCourse._count.enrollments} طالب مسجل. يجب إلغاء التسجيلات أولاً.`,
        409
      );
    }

    // Delete course (cascade will handle lessons and other related data)
    await prisma.course.delete({
      where: { id }
    });

    return createSuccessResponse({ 
      message: 'تم حذف الدورة بنجاح',
      deletedCourse: {
        id: existingCourse.id,
        title: existingCourse.title
      }
    });

  } catch (error) {
    console.error('Course DELETE error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}