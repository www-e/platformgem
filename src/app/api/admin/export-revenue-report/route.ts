// src/app/api/admin/export-revenue-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { period } = await request.json();

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
    const payments = await prisma.payment.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      include: {
        course: {
          select: { title: true }
        },
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV content
    const csvHeaders = [
      'التاريخ',
      'اسم الطالب',
      'البريد الإلكتروني',
      'اسم الدورة',
      'المبلغ',
      'العملة',
      'طريقة الدفع'
    ].join(',');

    const csvRows = payments.map(payment => [
      new Date(payment.createdAt).toLocaleDateString('ar-SA'),
      payment.user.name,
      payment.user.email || '',
      payment.course.title,
      payment.amount.toString(),
      payment.currency,
      payment.paymentMethod || 'بطاقة ائتمان'
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="revenue-report-${period}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export revenue report error:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم' },
      { status: 500 }
    );
  }
}