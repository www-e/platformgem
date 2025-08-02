// src/app/api/admin/payments/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createErrorResponse, ApiErrors } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const format = searchParams.get('format') || 'csv';

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Fetch payments with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Payment ID',
        'Student Name',
        'Student Email',
        'Course Title',
        'Amount',
        'Currency',
        'Status',
        'Payment Method',
        'PayMob Transaction ID',
        'Created At',
        'Updated At',
        'Failure Reason'
      ];

      const csvRows = payments.map(payment => [
        payment.id,
        payment.user.name || '',
        payment.user.email,
        payment.course.title,
        Number(payment.amount).toFixed(2),
        payment.currency,
        payment.status,
        payment.paymentMethod || '',
        payment.paymobTransactionId || '',
        payment.createdAt.toISOString(),
        payment.updatedAt.toISOString(),
        payment.failureReason || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => 
          row.map(field => 
            typeof field === 'string' && field.includes(',') 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } else if (format === 'json') {
      // Generate JSON
      const jsonData = payments.map(payment => ({
        id: payment.id,
        studentName: payment.user.name,
        studentEmail: payment.user.email,
        courseTitle: payment.course.title,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymobTransactionId: payment.paymobTransactionId,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        failureReason: payment.failureReason
      }));

      return NextResponse.json({
        success: true,
        data: jsonData,
        exportedAt: new Date().toISOString(),
        totalRecords: jsonData.length
      });
    }

    return createErrorResponse(
      'INVALID_FORMAT',
      'Unsupported export format. Use csv or json.',
      400
    );

  } catch (error) {
    console.error('Payment export error:', error);
    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}