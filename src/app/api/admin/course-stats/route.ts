// src/app/api/admin/course-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const [
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      payments,
      coursesWithPrices
    ] = await Promise.all([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isPublished: false } }),
      prisma.enrollment.count(),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true }
      }),
      prisma.course.findMany({
        where: { 
          price: { not: null },
          price: { gt: 0 }
        },
        select: { price: true }
      })
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const averagePrice = coursesWithPrices.length > 0 
      ? coursesWithPrices.reduce((sum, c) => sum + Number(c.price!), 0) / coursesWithPrices.length
      : 0;

    const stats = {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalRevenue,
      averagePrice
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Course stats error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}