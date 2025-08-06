// src/app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for category update
const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب').max(100, 'اسم الفئة طويل جداً').optional(),
  description: z.string().min(1, 'وصف الفئة مطلوب').max(500, 'وصف الفئة طويل جداً').optional(),
  iconUrl: z.string().url('رابط الأيقونة غير صحيح').optional().or(z.literal('')),
  slug: z.string().min(1, 'الرابط المختصر مطلوب').max(50, 'الرابط المختصر طويل جداً')
    .regex(/^[a-z0-9-]+$/, 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط').optional(),
  isActive: z.boolean().optional()
});

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/categories/[id] - Get single category
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        courses: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            price: true,
            currency: true,
            professor: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: { enrollments: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'الفئة غير موجودة'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: category,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Category GET error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/categories/[id] - Update category (Admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication and authorization
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'يجب تسجيل الدخول أولاً'
        },
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'غير مصرح لك بتعديل الفئات'
        },
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'الفئة غير موجودة'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = categoryUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'بيانات غير صحيحة',
          details: validationResult.error.issues
        },
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const updateData = validationResult.data;

    // Check for duplicate name or slug (excluding current category)
    if (updateData.name || updateData.slug) {
      const duplicateCheck = await prisma.category.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(updateData.name ? [{ name: updateData.name }] : []),
                ...(updateData.slug ? [{ slug: updateData.slug }] : [])
              ]
            }
          ]
        }
      });

      if (duplicateCheck) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'DUPLICATE_ERROR',
            message: duplicateCheck.name === updateData.name 
              ? 'يوجد فئة بهذا الاسم بالفعل' 
              : 'يوجد فئة بهذا الرابط المختصر بالفعل'
          },
          timestamp: new Date().toISOString()
        }, { status: 409 });
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...updateData,
        iconUrl: updateData.iconUrl === '' ? null : updateData.iconUrl
      },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Category PUT error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE /api/categories/[id] - Delete category (Admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    // Check authentication and authorization
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'يجب تسجيل الدخول أولاً'
        },
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'غير مصرح لك بحذف الفئات'
        },
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'الفئة غير موجودة'
        },
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Check if category has courses
    if (existingCategory._count.courses > 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'CONSTRAINT_ERROR',
          message: `لا يمكن حذف الفئة لأنها تحتوي على ${existingCategory._count.courses} دورة. يجب حذف أو نقل الدورات أولاً.`
        },
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    // Delete category
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: { message: 'تم حذف الفئة بنجاح' },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Category DELETE error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ في الخادم',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}