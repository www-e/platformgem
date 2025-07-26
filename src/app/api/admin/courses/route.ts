// src/app/api/admin/courses/route.ts
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

    const courses = await prisma.course.findMany({
      include: {
        professor: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        },
        payments: {
          where: { status: 'COMPLETED' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price ? Number(course.price) : null,
      currency: course.currency,
      isPublished: course.isPublished,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      professor: course.professor,
      category: course.category,
      _count: course._count,
      revenue: course.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    }));

    return NextResponse.json({ courses: formattedCourses });

  } catch (error) {
    console.error('Courses fetch error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}