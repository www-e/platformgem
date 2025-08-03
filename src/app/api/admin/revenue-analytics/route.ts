// src/app/api/admin/revenue-analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(_request.url);
    const period = searchParams.get('period') || 'month';

    // Calculate date ranges
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get payments data
    const [payments, allPayments, courses] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        },
        include: {
          course: {
            select: { title: true }
          },
          user: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true, createdAt: true }
      }),
      prisma.course.findMany({
        include: {
          professor: { select: { name: true } },
          payments: {
            where: { status: 'COMPLETED' },
            select: { amount: true }
          },
          _count: { select: { enrollments: true } }
        }
      })
    ]);

    // Calculate totals
    const totalRevenue = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const periodRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    // Calculate daily revenue for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPayments = payments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      paymentDate.setHours(0, 0, 0, 0);
      return paymentDate.getTime() === today.getTime();
    });
    const dailyRevenue = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate monthly revenue for current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthlyPayments = allPayments.filter(p => new Date(p.createdAt) >= currentMonth);
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Calculate previous month for growth
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousMonthPayments = allPayments.filter(p => {
      const paymentDate = new Date(p.createdAt);
      return paymentDate >= previousMonth && paymentDate < currentMonth;
    });
    const previousMonthRevenue = previousMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    // Top courses by revenue
    const topCourses = courses
      .map(course => ({
        id: course.id,
        title: course.title,
        professor: course.professor.name,
        revenue: course.payments.reduce((sum, p) => sum + Number(p.amount), 0),
        enrollments: course._count.enrollments
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent payments
    const recentPayments = payments.slice(0, 10).map(payment => ({
      id: payment.id,
      amount: Number(payment.amount),
      courseName: payment.course.title,
      studentName: payment.user.name,
      timestamp: payment.createdAt,
      status: 'completed' as const
    }));

    // Payment methods (simplified - assuming all are credit card for now)
    const paymentMethods = [
      {
        method: 'بطاقة ائتمان',
        count: payments.length,
        revenue: periodRevenue,
        percentage: 100
      }
    ];

    // Monthly data (simplified)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthPayments = allPayments.filter(p => {
        const paymentDate = new Date(p.createdAt);
        return paymentDate >= monthStart && paymentDate <= monthEnd;
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('ar-SA', { month: 'short', year: '2-digit' }),
        revenue: monthPayments.reduce((sum, p) => sum + Number(p.amount), 0),
        enrollments: monthPayments.length
      });
    }

    const revenueData = {
      totalRevenue,
      monthlyRevenue,
      dailyRevenue,
      revenueGrowth,
      topCourses,
      recentPayments,
      monthlyData,
      paymentMethods
    };

    return NextResponse.json(revenueData);

  } catch (error) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}