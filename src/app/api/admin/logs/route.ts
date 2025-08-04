// src/app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const dateFilter = searchParams.get('dateFilter') || 'today';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Since we don't have a logs table yet, let's create mock data from existing tables
    const logs = await generateSystemLogs(startDate, type, severity, search, page, limit);
    const totalLogs = await countSystemLogs(startDate, type, severity, search);
    
    const totalPages = Math.ceil(totalLogs / limit);

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total: totalLogs,
          pages: totalPages
        }
      }
    });

  } catch (error) {
    console.error('Logs fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateSystemLogs(
  startDate: Date, 
  type?: string | null, 
  severity?: string | null, 
  search?: string | null,
  page: number = 1,
  limit: number = 50
) {
  const logs: any[] = [];
  const skip = (page - 1) * limit;

  // Get user activities
  if (!type || type === 'USER') {
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    users.forEach(user => {
      logs.push({
        id: `user-${user.id}`,
        type: 'USER',
        action: 'USER_REGISTERED',
        description: `تم تسجيل مستخدم جديد: ${user.name}`,
        userId: user.id,
        userName: user.name,
        timestamp: user.createdAt.toISOString(),
        severity: 'SUCCESS',
        metadata: {
          role: user.role,
          email: user.email,
          phone: user.phone
        }
      });
    });
  }

  // Get payment activities
  if (!type || type === 'PAYMENT') {
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { course: { title: { contains: search, mode: 'insensitive' } } }
          ]
        })
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    payments.forEach(payment => {
      const severity = payment.status === 'COMPLETED' ? 'SUCCESS' : 
                      payment.status === 'FAILED' ? 'ERROR' : 'INFO';
      
      logs.push({
        id: `payment-${payment.id}`,
        type: 'PAYMENT',
        action: `PAYMENT_${payment.status}`,
        description: `دفعة ${payment.status === 'COMPLETED' ? 'مكتملة' : payment.status === 'FAILED' ? 'فاشلة' : 'معلقة'} للدورة: ${payment.course.title}`,
        userId: payment.userId,
        userName: payment.user.name,
        timestamp: payment.createdAt.toISOString(),
        severity,
        metadata: {
          amount: Number(payment.amount),
          currency: payment.currency,
          courseTitle: payment.course.title,
          paymobOrderId: payment.paymobOrderId
        }
      });
    });
  }

  // Get course activities
  if (!type || type === 'COURSE') {
    const courses = await prisma.course.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          title: { contains: search, mode: 'insensitive' }
        })
      },
      include: {
        professor: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    courses.forEach(course => {
      logs.push({
        id: `course-${course.id}`,
        type: 'COURSE',
        action: 'COURSE_CREATED',
        description: `تم إنشاء دورة جديدة: ${course.title}`,
        userId: course.professorId,
        userName: course.professor.name,
        timestamp: course.createdAt.toISOString(),
        severity: 'SUCCESS',
        metadata: {
          courseTitle: course.title,
          price: course.price ? Number(course.price) : null,
          isPublished: course.isPublished
        }
      });
    });
  }

  // Get enrollment activities
  if (!type || type === 'ENROLLMENT') {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        enrolledAt: { gte: startDate },
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { course: { title: { contains: search, mode: 'insensitive' } } }
          ]
        })
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { enrolledAt: 'desc' },
      take: limit,
      skip
    });

    enrollments.forEach(enrollment => {
      logs.push({
        id: `enrollment-${enrollment.id}`,
        type: 'ENROLLMENT',
        action: 'STUDENT_ENROLLED',
        description: `تم تسجيل الطالب ${enrollment.user.name} في دورة: ${enrollment.course.title}`,
        userId: enrollment.userId,
        userName: enrollment.user.name,
        timestamp: enrollment.enrolledAt.toISOString(),
        severity: 'SUCCESS',
        metadata: {
          courseTitle: enrollment.course.title,
          progressPercent: enrollment.progressPercent
        }
      });
    });
  }

  // Get certificate activities
  if (!type || type === 'CERTIFICATE') {
    const certificates = await prisma.certificate.findMany({
      where: {
        issuedAt: { gte: startDate },
        ...(search && {
          OR: [
            { studentName: { contains: search, mode: 'insensitive' } },
            { courseName: { contains: search, mode: 'insensitive' } }
          ]
        })
      },
      orderBy: { issuedAt: 'desc' },
      take: limit,
      skip
    });

    certificates.forEach(certificate => {
      logs.push({
        id: `certificate-${certificate.id}`,
        type: 'CERTIFICATE',
        action: 'CERTIFICATE_ISSUED',
        description: `تم إصدار شهادة للطالب ${certificate.studentName} في دورة: ${certificate.courseName}`,
        userId: certificate.userId,
        userName: certificate.studentName,
        timestamp: certificate.issuedAt.toISOString(),
        severity: 'SUCCESS',
        metadata: {
          certificateCode: certificate.certificateCode,
          courseName: certificate.courseName,
          professorName: certificate.professorName,
          grade: certificate.grade
        }
      });
    });
  }

  // Sort all logs by timestamp
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply severity filter
  const filteredLogs = severity && severity !== 'all' 
    ? logs.filter(log => log.severity.toLowerCase() === severity.toLowerCase())
    : logs;

  return filteredLogs.slice(0, limit);
}

async function countSystemLogs(
  startDate: Date, 
  type?: string | null, 
  severity?: string | null, 
  search?: string | null
): Promise<number> {
  let count = 0;

  if (!type || type === 'USER') {
    count += await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        })
      }
    });
  }

  if (!type || type === 'PAYMENT') {
    count += await prisma.payment.count({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { course: { title: { contains: search, mode: 'insensitive' } } }
          ]
        })
      }
    });
  }

  if (!type || type === 'COURSE') {
    count += await prisma.course.count({
      where: {
        createdAt: { gte: startDate },
        ...(search && {
          title: { contains: search, mode: 'insensitive' }
        })
      }
    });
  }

  if (!type || type === 'ENROLLMENT') {
    count += await prisma.enrollment.count({
      where: {
        enrolledAt: { gte: startDate },
        ...(search && {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { course: { title: { contains: search, mode: 'insensitive' } } }
          ]
        })
      }
    });
  }

  if (!type || type === 'CERTIFICATE') {
    count += await prisma.certificate.count({
      where: {
        issuedAt: { gte: startDate },
        ...(search && {
          OR: [
            { studentName: { contains: search, mode: 'insensitive' } },
            { courseName: { contains: search, mode: 'insensitive' } }
          ]
        })
      }
    });
  }

  return count;
}