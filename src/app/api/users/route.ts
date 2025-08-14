// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse, 
  authenticateAdmin, 
  isAuthError,
  extractSearchFilters,
  buildUserSearchWhere,
  withErrorHandling
} from '@/lib/api';

// GET /api/users - List users with optional role filter
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

  // Extract filters
  const filters = extractSearchFilters(request);
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  
  // Build where clause
  const whereClause = buildUserSearchWhere(filters);
  if (role) {
    whereClause.role = role as any;
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      bio: true,
      expertise: true,
      studentId: true,
      _count: {
        select: {
          ownedCourses: true,
          enrollments: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return createSuccessResponse({
    users: users
  });
});