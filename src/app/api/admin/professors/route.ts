// src/app/api/admin/professors/route.ts
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const hasCourses = searchParams.get('hasCourses');
    const revenueRange = searchParams.get('revenueRange');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const whereClause: any = {
      role: 'PROFESSOR'
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.isActive = status === 'active';
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo);
      }
    }

    // Handle courses filter
    if (hasCourses === 'yes') {
      whereClause.ownedCourses = { some: {} };
    } else if (hasCourses === 'no') {
      whereClause.ownedCourses = { none: {} };
    }

    const [professorsRaw, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        include: {
          ownedCourses: {
            include: {
              enrollments: {
                select: { id: true, userId: true }
              },
              payments: {
                where: { status: 'COMPLETED' },
                select: { amount: true, currency: true }
              },
              certificates: {
                select: { id: true }
              },
              progressMilestones: {
                where: { milestoneType: 'COURSE_COMPLETE' },
                select: { id: true, userId: true }
              },
              _count: {
                select: { 
                  enrollments: true,
                  lessons: true,
                  certificates: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Calculate enhanced statistics for each professor
    const professors = professorsRaw.map(professor => {
      const totalRevenue = professor.ownedCourses.reduce((sum, course) => {
        return sum + course.payments.reduce((courseSum, payment) => {
          return courseSum + Number(payment.amount);
        }, 0);
      }, 0);

      const totalEnrollments = professor.ownedCourses.reduce((sum, course) => sum + course._count.enrollments, 0);
      const totalCertificates = professor.ownedCourses.reduce((sum, course) => sum + course._count.certificates, 0);
      
      // Calculate completion rate
      const totalCompletions = professor.ownedCourses.reduce((sum, course) => {
        const uniqueCompletions = new Set(course.progressMilestones.map(p => p.userId)).size;
        return sum + uniqueCompletions;
      }, 0);
      
      const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

      return {
        id: professor.id,
        name: professor.name,
        email: professor.email,
        phone: professor.phone,
        bio: professor.bio,
        expertise: professor.expertise,
        isActive: professor.isActive,
        createdAt: professor.createdAt,
        stats: {
          totalRevenue,
          totalEnrollments,
          totalCertificates,
          completionRate: Math.round(completionRate),
          coursesCount: professor.ownedCourses.length
        },
        ownedCourses: professor.ownedCourses.map(course => ({
          id: course.id,
          title: course.title,
          _count: course._count
        }))
      };
    });

    // Apply revenue range filter after calculation
    let filteredProfessors = professors;
    if (revenueRange) {
      filteredProfessors = professors.filter(prof => {
        const revenue = prof.stats.totalRevenue;
        switch (revenueRange) {
          case '0-1000':
            return revenue >= 0 && revenue <= 1000;
          case '1000-5000':
            return revenue > 1000 && revenue <= 5000;
          case '5000-10000':
            return revenue > 5000 && revenue <= 10000;
          case '10000+':
            return revenue > 10000;
          default:
            return true;
        }
      });
    }

    // Sort professors by revenue (ranking)
    const rankedProfessors = filteredProfessors.sort((a, b) => b.stats.totalRevenue - a.stats.totalRevenue);

    return NextResponse.json({ 
      professors: rankedProfessors,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Professors fetch error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}