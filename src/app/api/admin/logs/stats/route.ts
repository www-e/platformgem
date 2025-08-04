// src/app/api/admin/logs/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate stats from existing data
    const [
      totalUsers,
      todayUsers,
      totalPayments,
      todayPayments,
      failedPayments,
      totalCourses,
      todayCourses,
      totalEnrollments,
      todayEnrollments,
      totalCertificates,
      todayCertificates
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.payment.count({ where: { status: 'FAILED' } }),
      prisma.course.count(),
      prisma.course.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { enrolledAt: { gte: todayStart } } }),
      prisma.certificate.count(),
      prisma.certificate.count({ where: { issuedAt: { gte: todayStart } } })
    ]);

    const stats = {
      totalLogs: totalUsers + totalPayments + totalCourses + totalEnrollments + totalCertificates,
      todayLogs: todayUsers + todayPayments + todayCourses + todayEnrollments + todayCertificates,
      errorLogs: failedPayments, // Simplified - in real system would track all errors
      warningLogs: 0, // Would be calculated from actual warning logs
      userActions: totalUsers,
      paymentActions: totalPayments,
      courseActions: totalCourses + totalEnrollments,
      systemActions: totalCertificates
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Log stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}