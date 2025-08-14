// src/app/api/admin/students/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse,
  authenticateAdmin,
  isAuthError,
  extractPaginationParams,
  extractSearchFilters,
  buildUserSearchWhere,
  createPaginatedResponse,
  withErrorHandling
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
  
  // Additional student-specific filters
  const hasEnrollments = searchParams.get('hasEnrollments');
  const hasCertificates = searchParams.get('hasCertificates');

  // Build where clause
  const whereClause = buildUserSearchWhere(filters);
  whereClause.role = 'STUDENT';

  // Handle enrollment and certificate filters
  if (hasEnrollments === 'yes') {
    whereClause.enrollments = { some: {} };
  } else if (hasEnrollments === 'no') {
    whereClause.enrollments = { none: {} };
  }

  if (hasCertificates === 'yes') {
    whereClause.certificates = { some: {} };
  } else if (hasCertificates === 'no') {
    whereClause.certificates = { none: {} };
  }

  const [students, totalCount] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      include: {
        enrollments: {
          select: {
            id: true,
            progressPercent: true,
            course: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        certificates: {
          select: {
            id: true,
            courseName: true,
            issuedAt: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.user.count({ where: whereClause })
  ]);

  const response = createPaginatedResponse(students, page, limit, totalCount);
  return createSuccessResponse(response);
});