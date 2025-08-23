// src/app/api/admin/course-stats/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
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

    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      payments,
      coursesWithPrices,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isPublished: false } }),
      prisma.enrollment.count(),
      prisma.payment.findMany({
        where: { status: "COMPLETED" },
        select: { amount: true },
      }),
      prisma.course.findMany({
        where: {
          AND: [{ price: { not: null } }, { price: { gt: 0 } }],
        },
        select: { price: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const averagePrice =
      coursesWithPrices.length > 0
        ? coursesWithPrices.reduce((sum, c) => sum + Number(c.price!), 0) /
          coursesWithPrices.length
        : 0;

  const stats = {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalEnrollments,
    totalRevenue,
    averagePrice,
  };

  return createSuccessResponse(stats);
});
