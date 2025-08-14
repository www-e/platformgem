// src/app/api/admin/courses/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse,
  createErrorResponse,
  authenticateAdmin,
  isAuthError,
  extractPaginationParams,
  extractSearchFilters,
  buildCourseSearchWhere,
  createPaginatedResponse,
  validateRequestBody,
  isValidationError,
  courseSchema,
  commonQueries,
  isDatabaseError,
  withErrorHandling,
  ApiErrors
} from '@/lib/api';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Extract pagination and filters
  const { page, limit, skip } = extractPaginationParams(request);
  const filters = extractSearchFilters(request);
  const { searchParams } = new URL(request.url);
  
  // Additional course-specific filters
  const professor = searchParams.get('professor');
  const priceType = searchParams.get('priceType');

  // Build where clause
  const whereClause = buildCourseSearchWhere(filters);

  if (professor) {
    whereClause.professorId = professor;
  }

  if (priceType) {
    if (priceType === 'free') {
      whereClause.price = null;
    } else if (priceType === 'paid') {
      whereClause.price = { not: null };
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
      skip,
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

  const response = createPaginatedResponse(formattedCourses, page, limit, totalCount);
  return createSuccessResponse(response);
});

// POST /api/admin/courses - Create new course (Admin only)
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Validate request body
  const validationResult = await validateRequestBody(request, courseSchema);
  if (isValidationError(validationResult)) {
    return validationResult;
  }

  const {
    title,
    description,
    categoryId,
    professorId,
    price,
    currency,
    thumbnailUrl,
    bunnyLibraryId,
    isPublished
  } = validationResult;

  // Verify category exists
  const categoryResult = await commonQueries.checkCategoryExists(categoryId);
  if (isDatabaseError(categoryResult)) {
    return categoryResult;
  }
  if (!categoryResult) {
    return createErrorResponse(
      ApiErrors.NOT_FOUND.code,
      'التصنيف المحدد غير موجود',
      ApiErrors.NOT_FOUND.status
    );
  }

  // Verify professor exists
  const professorResult = await commonQueries.checkUserExists(professorId, 'PROFESSOR');
  if (isDatabaseError(professorResult)) {
    return professorResult;
  }
  if (!professorResult) {
    return createErrorResponse(
      ApiErrors.NOT_FOUND.code,
      'المدرس المحدد غير موجود',
      ApiErrors.NOT_FOUND.status
    );
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      categoryId,
      professorId,
      price: price ? parseFloat(price.toString()) : null,
      currency,
      thumbnailUrl,
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

  return createSuccessResponse({
    ...course,
    price: course.price ? Number(course.price) : null
  }, 'تم إنشاء الدورة بنجاح', 201);
});