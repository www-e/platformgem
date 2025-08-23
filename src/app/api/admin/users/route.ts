// src/app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  createSuccessResponse,
  authenticateAdmin,
  isAuthError,
  withErrorHandling
} from '@/lib/api';

export const GET = withErrorHandling(async (_request: NextRequest) => {
  // Authenticate admin
  const authResult = await authenticateAdmin();
  if (isAuthError(authResult)) {
    return authResult;
  }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        // lastLogin: true, // Field doesn't exist in current schema
        _count: {
          select: {
            enrollments: true,
            ownedCourses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: undefined, // Field doesn't exist in current schema
      enrollmentCount: user.role === 'STUDENT' ? user._count?.enrollments : undefined,
      courseCount: user.role === 'PROFESSOR' ? user._count?.ownedCourses : undefined
    }));

  return createSuccessResponse({ 
    users: formattedUsers 
  });
});