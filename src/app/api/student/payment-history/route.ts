// src/app/api/student/payment-history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const studentId = session.user.id;

    // Get student's payment history
    const payments = await prisma.payment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform payments data
    const transactions = payments.map((payment) => ({
      id: payment.id,
      courseName: payment.course.title,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status.toLowerCase(),
      paymentMethod: payment.paymentMethod || 'credit_card',
      transactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : payment.id,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
      paymobOrderId: payment.paymobOrderId,
      paymobTransactionId: payment.paymobTransactionId ? Number(payment.paymobTransactionId) : null,
      failureReason: payment.failureReason,
      refundReason: payment.status === 'REFUNDED' ? payment.failureReason || 'طلب من العميل' : undefined
    }));

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Payment history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}