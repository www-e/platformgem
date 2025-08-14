// src/app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
export interface LogEntry {
  id: string;
  type:
    | "USER"
    | "PAYMENT"
    | "COURSE"
    | "ENROLLMENT"
    | "CERTIFICATE"
    | "SYSTEM";
  action: string;
  description: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  severity: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
}
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Since we don't have a logs table yet, let's create mock data based on actual system activities
    // In a real implementation, you would have a proper logs table
    
    // For now, let's generate logs from existing data
    const logs = await generateSystemLogs({
      page,
      limit,
      search,
      type,
      severity,
      dateFrom,
      dateTo
    });

    return NextResponse.json({
      success: true,
      data: {
        logs: logs.data,
        pagination: {
          page,
          limit,
          total: logs.total,
          pages: Math.ceil(logs.total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Logs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}

async function generateSystemLogs(params: {
  page: number;
  limit: number;
  search?: string | null;
  type?: string | null;
  severity?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}) {
  const { page, limit } = params;
  const skip = (page - 1) * limit;

  // Generate logs from various system activities
  const logs: LogEntry[] = [];

  // User registration logs
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      isActive: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  users.forEach(user => {
    logs.push({
      id: `user_${user.id}_created`,
      type: 'USER',
      action: 'USER_REGISTERED',
      description: `تم تسجيل مستخدم جديد: ${user.name} (${user.role})`,
      userId: user.id,
      userName: user.name,
      metadata: { role: user.role, isActive: user.isActive },
      timestamp: user.createdAt.toISOString(),
      severity: 'SUCCESS',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  // Enrollment logs
  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } }
    },
    orderBy: { enrolledAt: 'desc' },
    take: 50
  });

  enrollments.forEach(enrollment => {
    logs.push({
      id: `enrollment_${enrollment.id}`,
      type: 'ENROLLMENT',
      action: 'STUDENT_ENROLLED',
      description: `تم تسجيل الملتحق ${enrollment.user.name} في دورة: ${enrollment.course.title}`,
      userId: enrollment.user.id,
      userName: enrollment.user.name,
      metadata: { 
        courseTitle: enrollment.course.title,
        progressPercent: enrollment.progressPercent
      },
      timestamp: enrollment.enrolledAt.toISOString(),
      severity: 'SUCCESS',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  // Payment logs
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true } },
      course: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  payments.forEach(payment => {
    const severity = payment.status === 'COMPLETED' ? 'SUCCESS' : 
                    payment.status === 'FAILED' ? 'ERROR' : 'INFO';
    
    logs.push({
      id: `payment_${payment.id}`,
      type: 'PAYMENT',
      action: `PAYMENT_${payment.status}`,
      description: `${payment.status === 'COMPLETED' ? 'تم' : payment.status === 'FAILED' ? 'فشل' : 'جاري'} دفع ${Number(payment.amount)} ${payment.currency} للدورة: ${payment.course.title}`,
      userId: payment.user.id,
      userName: payment.user.name,
      metadata: { 
        amount: Number(payment.amount),
        currency: payment.currency,
        courseTitle: payment.course.title,
        paymobTransactionId: payment.paymobTransactionId
      },
      timestamp: payment.createdAt.toISOString(),
      severity,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  // Course creation logs
  const courses = await prisma.course.findMany({
    include: {
      professor: { select: { id: true, name: true } },
      category: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 30
  });

  courses.forEach(course => {
    logs.push({
      id: `course_${course.id}_created`,
      type: 'COURSE',
      action: 'COURSE_CREATED',
      description: `تم إنشاء دورة جديدة: ${course.title} بواسطة ${course.professor.name}`,
      userId: course.professor.id,
      userName: course.professor.name,
      metadata: { 
        courseTitle: course.title,
        category: course.category.name,
        isPublished: course.isPublished,
        price: course.price ? Number(course.price) : null
      },
      timestamp: course.createdAt.toISOString(),
      severity: 'INFO',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  // Certificate logs
  const certificates = await prisma.certificate.findMany({
    include: {
      user: { select: { id: true, name: true } }
    },
    orderBy: { issuedAt: 'desc' },
    take: 30
  });

  certificates.forEach(certificate => {
    logs.push({
      id: `certificate_${certificate.id}`,
      type: 'CERTIFICATE',
      action: 'CERTIFICATE_ISSUED',
      description: `تم إصدار شهادة للملتحق ${certificate.user.name} في دورة: ${certificate.courseName}`,
      userId: certificate.user.id,
      userName: certificate.user.name,
      metadata: { 
        courseName: certificate.courseName,
        certificateCode: certificate.certificateCode,
        grade: certificate.grade
      },
      timestamp: certificate.issuedAt.toISOString(),
      severity: 'SUCCESS',
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
  });

  // Sort all logs by timestamp
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply filters
  let filteredLogs = logs;

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredLogs = filteredLogs.filter(log => 
      log.description.toLowerCase().includes(searchLower) ||
      log.userName?.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower)
    );
  }

  if (params.type) {
    filteredLogs = filteredLogs.filter(log => log.type === params.type);
  }

  if (params.severity) {
    filteredLogs = filteredLogs.filter(log => log.severity === params.severity);
  }

  if (params.dateFrom) {
    const fromDate = new Date(params.dateFrom);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= fromDate);
  }

  if (params.dateTo) {
    const toDate = new Date(params.dateTo);
    toDate.setHours(23, 59, 59, 999);
    filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= toDate);
  }

  const total = filteredLogs.length;
  const paginatedLogs = filteredLogs.slice(skip, skip + limit);

  return {
    data: paginatedLogs,
    total
  };
}