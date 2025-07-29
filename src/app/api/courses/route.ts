// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

// Validation schema for course creation
const courseCreateSchema = z.object({
  title: z.string().min(1, 'عنوان الدورة مطلوب').max(200, 'عنوان الدورة طويل جداً'),
  description: z.string().min(1, 'وصف الدورة مطلوب').max(2000, 'وصف الدورة طويل جداً'),
  thumbnailUrl: z.string().url('رابط الصورة المصغرة غير صحيح'),
  categoryId: z.string().min(1, 'فئة الدورة مطلوبة'),
  bunnyLibraryId: z.string().min(1, 'معرف مكتبة Bunny مطلوب'),
  price: z.number().min(0, 'السعر لا يمكن أن يكون سالباً').optional(),
  currency: z.string().default('EGP'),
});

// GET /api/courses - List courses with filtering and pagination
export async function GET(_request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50); // Max 50 per page
    const categoryId = searchParams.get('categoryId');
    const professorId = searchParams.get('professorId');
    const search = searchParams.get('search');
    const priceFilter = searchParams.get('priceFilter'); // 'free', 'paid', 'all'
    const sortBy = searchParams.get('sortBy') || 'created'; // 'created', 'title', 'price', 'enrollments'
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'asc', 'desc'
    const publishedOnly = searchParams.get('publishedOnly') !== 'false'; // Default true

    // Build where clause
    const whereClause: any = {};
    
    if (publishedOnly) {
      whereClause.isPublished = true;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (professorId) {
      whereClause.professorId = professorId;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (priceFilter === 'free') {
      whereClause.price = null;
    } else if (priceFilter === 'paid') {
      whereClause.price = { not: null };
    }

    // Build order clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'title':
        orderBy = { title: sortOrder };
        break;
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'enrollments':
        orderBy = { enrollments: { _count: sortOrder } };
        break;
      case 'created':
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    // Execute queries
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
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
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.course.count({ where: whereClause })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return createSuccessResponse({
      courses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        categoryId,
        professorId,
        search,
        priceFilter,
        sortBy,
        sortOrder,
        publishedOnly
      }
    });

  } catch (error) {
    console.error('Courses GET error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}

// POST /api/courses - Create new course (Professor/Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication and authorization
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    if (!['ADMIN', 'PROFESSOR'].includes(session.user.role)) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بإنشاء الدورات',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = courseCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        ApiErrors.VALIDATION_ERROR.message,
        ApiErrors.VALIDATION_ERROR.status,
        validationResult.error.issues
      );
    }

    const { title, description, thumbnailUrl, categoryId, bunnyLibraryId, price, currency } = validationResult.data;

    // Verify category exists and is active
    const category = await prisma.category.findFirst({
      where: { id: categoryId, isActive: true }
    });

    if (!category) {
      return createErrorResponse(
        'INVALID_CATEGORY',
        'الفئة المحددة غير موجودة أو غير نشطة',
        400
      );
    }

    // Check for duplicate title by the same professor
    const existingCourse = await prisma.course.findFirst({
      where: {
        title,
        professorId: session.user.id
      }
    });

    if (existingCourse) {
      return createErrorResponse(
        ApiErrors.DUPLICATE_ERROR.code,
        'لديك دورة بهذا العنوان بالفعل',
        ApiErrors.DUPLICATE_ERROR.status
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnailUrl,
        categoryId,
        professorId: session.user.id,
        bunnyLibraryId,
        price: price || null,
        currency,
        isPublished: false // Courses start as drafts
      },
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

    return createSuccessResponse(course, 201);

  } catch (error) {
    console.error('Courses POST error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}