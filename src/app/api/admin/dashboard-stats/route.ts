// src/app/api/admin/dashboard-stats/route.ts
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

    // Get all stats in parallel
    const [
      totalUsers,
      totalStudents,
      totalProfessors,
      totalCourses,
      totalCategories,
      activeCourses,
      totalEnrollments,
      certificatesIssued,
      payments,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'PROFESSOR' } }),
      prisma.course.count(),
      prisma.category.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      // Temporarily return 0 for certificates until model is available
      Promise.resolve(0),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, createdAt: true }
      }),
      // Recent activity - simplified for now
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } }
        }
      })
    ]);

    // Calculate revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    
    // Calculate monthly revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyPayments = payments.filter(p => new Date(p.createdAt) >= currentMonth);
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

    // Format recent activity
    const formattedActivity = recentActivity.map(enrollment => ({
      id: enrollment.id,
      type: 'enrollment' as const,
      description: `${enrollment.user.name} سجل في دورة ${enrollment.course.title}`,
      timestamp: enrollment.enrolledAt,
      user: enrollment.user.name
    }));

    // Real-time metrics
    const realTimeMetrics = {
      activeUsers: 0, // Placeholder - would need WebSocket or real-time tracking
      ongoingLessons: 0, // Placeholder
      recentSignups: 0, // Placeholder
      pendingPayments: 0 // Placeholder
    };

    // System health (simulated)
    const systemHealth = {
      database: { status: 'healthy' as const, responseTime: 25 },
      server: { status: 'healthy' as const, cpuUsage: 45, memoryUsage: 65 },
      storage: { status: 'healthy' as const, usedSpace: 150, totalSpace: 500 },
      network: { status: 'healthy' as const, latency: 15 }
    };

    const stats = {
      totalUsers,
      totalStudents,
      totalProfessors,
      totalCourses,
      totalCategories,
      totalRevenue,
      monthlyRevenue,
      totalEnrollments,
      activeCourses,
      certificatesIssued,
      recentActivity: formattedActivity,
      realTimeMetrics,
      systemHealth
    };

    return createSuccessResponse(stats);
});