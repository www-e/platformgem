// src/app/api/professor/earnings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PROFESSOR') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const professorId = session.user.id;

    // Get professor's courses with payments
    const courses = await prisma.course.findMany({
      where: { professorId },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
          include: {
            user: true
          }
        },
        enrollments: true,
        category: true
      }
    });

    // Calculate total earnings
    const totalEarnings = courses.reduce((sum, course) => {
      return sum + course.payments.reduce((courseSum, payment) => {
        return courseSum + Number(payment.amount);
      }, 0);
    }, 0);

    // Calculate monthly earnings (current month)
    const currentMonth = new Date();
    currentMonth.setDate(1);
    const monthlyEarnings = courses.reduce((sum, course) => {
      return sum + course.payments
        .filter(payment => new Date(payment.createdAt) >= currentMonth)
        .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0);
    }, 0);

    // Calculate daily earnings (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyEarnings = courses.reduce((sum, course) => {
      return sum + course.payments
        .filter(payment => new Date(payment.createdAt) >= today)
        .reduce((daySum, payment) => daySum + Number(payment.amount), 0);
    }, 0);

    // Calculate earnings growth (compare with previous month)
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    previousMonth.setDate(1);
    const previousMonthEnd = new Date(currentMonth);
    previousMonthEnd.setDate(0);

    const previousMonthEarnings = courses.reduce((sum, course) => {
      return sum + course.payments
        .filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= previousMonth && paymentDate <= previousMonthEnd;
        })
        .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0);
    }, 0);

    const earningsGrowth = previousMonthEarnings > 0 
      ? ((monthlyEarnings - previousMonthEarnings) / previousMonthEarnings) * 100 
      : 0;

    // Mock pending payouts (would be calculated based on payout schedule)
    const pendingPayouts = monthlyEarnings * 0.85; // Assuming 15% platform fee
    const nextPayoutDate = new Date();
    nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // Next week

    // Top earning courses
    const topEarningCourses = courses
      .map(course => {
        const earnings = course.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const students = course.enrollments.length;
        const averagePrice = course.price ? Number(course.price) : 0;
        
        // Mock conversion rate (would be calculated from actual data)
        const conversionRate = Math.random() * 20 + 5; // 5-25%

        return {
          id: course.id,
          title: course.title,
          earnings,
          students,
          averagePrice,
          conversionRate
        };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Recent transactions
    const allPayments = courses.flatMap(course => 
      course.payments.map(payment => ({
        ...payment,
        courseName: course.title
      }))
    );

    const recentTransactions = allPayments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(payment => ({
        id: payment.id,
        courseName: payment.courseName,
        studentName: payment.user.name,
        amount: Number(payment.amount),
        date: payment.createdAt,
        status: payment.status.toLowerCase() as 'completed' | 'pending' | 'refunded',
        commission: Number(payment.amount) * 0.15 // 15% platform fee
      }));

    // Monthly breakdown (last 6 months)
    const monthlyBreakdown = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthEarnings = courses.reduce((sum, course) => {
        return sum + course.payments
          .filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
          })
          .reduce((monthSum, payment) => monthSum + Number(payment.amount), 0);
      }, 0);

      const monthStudents = new Set(
        courses.flatMap(course => 
          course.payments
            .filter(payment => {
              const paymentDate = new Date(payment.createdAt);
              return paymentDate >= monthStart && paymentDate <= monthEnd;
            })
            .map(payment => payment.userId)
        )
      ).size;

      const monthCourses = courses.filter(course => {
        const courseDate = new Date(course.createdAt);
        return courseDate >= monthStart && courseDate <= monthEnd;
      }).length;

      // Calculate growth compared to previous month
      const prevMonthEarnings = i < 5 ? monthlyBreakdown[monthlyBreakdown.length - 1]?.earnings || 0 : 0;
      const growth = prevMonthEarnings > 0 ? ((monthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100 : 0;

      monthlyBreakdown.push({
        month: date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        earnings: monthEarnings,
        students: monthStudents,
        courses: monthCourses,
        growth
      });
    }

    // Earnings by category
    const categoryEarnings = new Map();
    courses.forEach(course => {
      const categoryName = course.category?.name || 'غير مصنف';
      const courseEarnings = course.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      
      if (!categoryEarnings.has(categoryName)) {
        categoryEarnings.set(categoryName, { earnings: 0, courses: 0 });
      }
      
      const category = categoryEarnings.get(categoryName);
      category.earnings += courseEarnings;
      category.courses++;
    });

    const earningsByCategory = Array.from(categoryEarnings.entries()).map(([category, data]) => ({
      category,
      earnings: data.earnings,
      percentage: totalEarnings > 0 ? (data.earnings / totalEarnings) * 100 : 0,
      courses: data.courses
    }));

    // Mock payout history
    const payoutHistory = [
      {
        id: '1',
        amount: totalEarnings * 0.3,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        status: 'completed' as const,
        method: 'Bank Transfer'
      },
      {
        id: '2',
        amount: totalEarnings * 0.2,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        status: 'completed' as const,
        method: 'Bank Transfer'
      }
    ];

    const earningsData = {
      totalEarnings,
      monthlyEarnings,
      dailyEarnings,
      earningsGrowth,
      pendingPayouts,
      nextPayoutDate,
      topEarningCourses,
      recentTransactions,
      monthlyBreakdown,
      earningsByCategory,
      payoutHistory
    };

    return NextResponse.json(earningsData);

  } catch (error) {
    console.error('Earnings data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}