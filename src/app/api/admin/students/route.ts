// src/app/api/admin/students/route.ts
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
    const hasEnrollments = searchParams.get('hasEnrollments');
    const hasCertificates = searchParams.get('hasCertificates');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build where clause
    const whereClause: any = {
      role: 'STUDENT'
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } }
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

    // Handle enrollment and certificate filters
    if (hasEnrollments === 'yes') {
      whereClause.enrollments = { some: {} };
    } else if (hasEnrollments === 'no') {
      whereClause.enrollments = { none: {} };
    }

    if (hasCertificates === 'yes') {
      whereClause.certificates = { some: {} };
    } else if (hasCertificates === 'no') {
      whereClause.certificates = { none: {} };
    }

    const [students, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        include: {
          enrollments: {
            select: {
              id: true,
              progressPercent: true,
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          certificates: {
            select: {
              id: true,
              courseName: true,
              issuedAt: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              certificates: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    return NextResponse.json({ 
      students,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    });

  } catch (error) {
    console.error('Students fetch error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}