// src/app/api/users/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';

// GET /api/users - List users with optional role filter
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication and authorization
    if (!session?.user) {
      return createErrorResponse(ApiErrors.UNAUTHORIZED.code, ApiErrors.UNAUTHORIZED.message, ApiErrors.UNAUTHORIZED.status);
    }

    // Only admins can list users
    if (session.user.role !== 'ADMIN') {
      return createErrorResponse(ApiErrors.FORBIDDEN.code, 'غير مصرح لك بعرض قائمة المستخدمين', ApiErrors.FORBIDDEN.status);
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const whereClause: Record<string, unknown> = {};
    
    if (role) {
      whereClause.role = role;
    }
    
    if (!includeInactive) {
      whereClause.isActive = true;
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

  } catch (error) {
    console.error('Users GET error:', error);
    return createErrorResponse(ApiErrors.INTERNAL_ERROR.code, ApiErrors.INTERNAL_ERROR.message, ApiErrors.INTERNAL_ERROR.status, error);
  }
}