// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for category creation/update
const categorySchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب').max(100, 'اسم الفئة طويل جداً'),
  description: z.string().min(1, 'وصف الفئة مطلوب').max(500, 'وصف الفئة طويل جداً'),
  iconUrl: z.string().url('رابط الأيقونة غير صحيح').optional().or(z.literal('')),
  slug: z.string().min(1, 'الرابط المختصر مطلوب').max(50, 'الرابط المختصر طويل جداً')
    .regex(/^[a-z0-9-]+$/, 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'),
});

// GET /api/categories - List all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const categories = await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { courses: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: categories,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Categories GET error:', error);
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

// POST /api/categories - Create new category (Admin only)
export async function POST(request: NextRequest) {
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
          message: 'غير مصرح لك بإنشاء الفئات'
        },
        timestamp: new Date().toISOString()
      }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = categorySchema.safeParse(body);

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

    const { name, description, iconUrl, slug } = validationResult.data;

    // Check for duplicate name or slug
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DUPLICATE_ERROR',
          message: existingCategory.name === name 
            ? 'يوجد فئة بهذا الاسم بالفعل' 
            : 'يوجد فئة بهذا الرابط المختصر بالفعل'
        },
        timestamp: new Date().toISOString()
      }, { status: 409 });
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        name,
        description,
        iconUrl: iconUrl || null,
        slug,
        isActive: true
      },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: category,
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('Categories POST error:', error);
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