// src/app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const professor = searchParams.get('professor');
    const status = searchParams.get('status');
    const priceType = searchParams.get('priceType');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const whereClause: Prisma.CourseWhereInput = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category) {
      whereClause.categoryId = category;
    }

    if (professor) {
      whereClause.professorId = professor;
    }

    if (status) {
      whereClause.isPublished = status === 'published';
    }

    if (priceType) {
      if (priceType === 'free') {
        whereClause.price = null;
      } else if (priceType === 'paid') {
        whereClause.price = { not: null };
      }
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    const [courses, totalCount] = await prisma.$transaction([
      prisma.course.findMany({
        where: whereClause,
        include: {
          professor: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              lessons: true
            }
          },
          payments: {
            where: { status: 'COMPLETED' },
            select: { amount: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.course.count({ where: whereClause })
    ]);

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price ? Number(course.price) : null,
      currency: course.currency,
      isPublished: course.isPublished,
      thumbnailUrl: course.thumbnailUrl,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      professor: course.professor,
      category: course.category,
      _count: course._count,
      revenue: course.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    }));

    return NextResponse.json({ 
      courses: formattedCourses,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      categoryId,
      professorId,
      price,
      currency = 'EGP',
      thumbnailUrl,
      bunnyLibraryId,
      isPublished = false
    } = body;

    // Validate required fields
    if (!title || !description || !categoryId || !professorId || !bunnyLibraryId) {
      return NextResponse.json(
        { error: 'جميع الحقول المطلوبة يجب أن تكون مملوءة' },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'التصنيف المحدد غير موجود' },
        { status: 400 }
      );
    }

    // Verify professor exists
    const professor = await prisma.user.findUnique({
      where: { id: professorId, role: 'PROFESSOR' }
    });

    if (!professor) {
      return NextResponse.json(
        { error: 'المدرس المحدد غير موجود' },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        categoryId,
        professorId,
        price: price ? parseFloat(price) : null,
        currency,
        thumbnailUrl: thumbnailUrl || '',
        bunnyLibraryId,
        isPublished
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        price: course.price ? Number(course.price) : null
      }
    });

  } catch (error) {
    console.error('Course creation error:', error);
    return NextResponse.json(
      { error: 'خطأ في إنشاء الدورة' },
      { status: 500 }
    );
  }
}