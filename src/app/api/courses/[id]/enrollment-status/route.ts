// src/app/api/courses/[id]/enrollment-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: { id: string }
}

// GET /api/courses/[id]/enrollment-status - Get enrollment status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: courseId } = params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ isEnrolled: false });
    }

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      },
      select: {
        id: true,
        progressPercent: true,
        enrolledAt: true
      }
    });

    if (enrollment) {
      return NextResponse.json({
        isEnrolled: true,
        enrollment: {
          id: enrollment.id,
          progressPercent: enrollment.progressPercent,
          enrolledAt: enrollment.enrolledAt.toISOString()
        }
      });
    }

    // Check payment status
    const payment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId
      },
      select: {
        status: true
      },
      orderBy: { createdAt: 'desc' }
    });

    let paymentStatus: 'none' | 'pending' | 'completed' | 'failed' = 'none';
    if (payment) {
      switch (payment.status) {
        case 'PENDING':
          paymentStatus = 'pending';
          break;
        case 'COMPLETED':
          paymentStatus = 'completed';
          break;
        case 'FAILED':
          paymentStatus = 'failed';
          break;
      }
    }

    return NextResponse.json({
      isEnrolled: false,
      paymentStatus
    });

  } catch (error) {
    console.error('Enrollment status API error:', error);
    return NextResponse.json({ isEnrolled: false }, { status: 500 });
  }
}