// src/app/api/admin/user-stats/route.ts
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

    // Calculate date for "this month"
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalStudents,
      totalProfessors,
      totalAdmins,
      activeUsers,
      newUsersThisMonth
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'PROFESSOR' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          createdAt: { gte: currentMonth }
        }
      })
    ]);

  const stats = {
    totalUsers,
    totalStudents,
    totalProfessors,
    totalAdmins,
    activeUsers,
    newUsersThisMonth
  };

  return createSuccessResponse(stats);
});