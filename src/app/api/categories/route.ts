// src/app/api/categories/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse,
  createErrorResponse,
  authenticateAdmin,
  isAuthError,
  extractSearchFilters,
  validateRequestBody,
  isValidationError,
  categorySchema,
  withErrorHandling,
  ApiErrors
} from '@/lib/api';

// GET /api/categories - List all categories
export const GET = withErrorHandling(async (request: NextRequest) => {
  const filters = extractSearchFilters(request);
  
  const categories = await prisma.category.findMany({
    where: filters.includeInactive ? {} : { isActive: true },
    include: {
      _count: {
        select: { courses: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return createSuccessResponse({
    categories: categories
  });
});

// POST /api/categories - Create new category (Admin only)
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Validate request body
  const validationResult = await validateRequestBody(request, categorySchema);
  if (isValidationError(validationResult)) {
    return validationResult;
  }

  const { name, description, iconUrl, slug } = validationResult;

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
    return createErrorResponse(
      ApiErrors.DUPLICATE_ERROR.code,
      existingCategory.name === name 
        ? 'يوجد فئة بهذا الاسم بالفعل' 
        : 'يوجد فئة بهذا الرابط المختصر بالفعل',
      ApiErrors.DUPLICATE_ERROR.status
    );
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

  return createSuccessResponse(category, 'تم إنشاء الفئة بنجاح', 201);
});