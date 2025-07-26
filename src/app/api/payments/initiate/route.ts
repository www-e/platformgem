// src/app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { payMobService } from '@/lib/paymob';
import { createSuccessResponse, createErrorResponse, ApiErrors } from '@/lib/api-utils';
import { z } from 'zod';

// Validation schema for payment initiation
const paymentInitiateSchema = z.object({
  courseId: z.string().min(1, 'معرف الدورة مطلوب'),
});

// POST /api/payments/initiate - Initiate payment for a course
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check authentication
    if (!session?.user) {
      return createErrorResponse(
        ApiErrors.UNAUTHORIZED.code,
        ApiErrors.UNAUTHORIZED.message,
        ApiErrors.UNAUTHORIZED.status
      );
    }

    // Only students can make payments (admins can for testing)
    if (!['STUDENT', 'ADMIN'].includes(session.user.role)) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        'غير مصرح لك بإجراء عمليات الدفع',
        ApiErrors.FORBIDDEN.status
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = paymentInitiateSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        ApiErrors.VALIDATION_ERROR.code,
        ApiErrors.VALIDATION_ERROR.message,
        ApiErrors.VALIDATION_ERROR.status,
        validationResult.error.errors
      );
    }

    const { courseId } = validationResult.data;

    // Check if course exists and is published
    const course = await prisma.course.findFirst({
      where: { 
        id: courseId, 
        isPublished: true 
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (!course) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'الدورة غير موجودة أو غير منشورة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check if course is paid
    if (!course.price || course.price <= 0) {
      return createErrorResponse(
        'FREE_COURSE',
        'هذه الدورة مجانية ولا تحتاج لدفع',
        400
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return createErrorResponse(
        ApiErrors.DUPLICATE_ERROR.code,
        'أنت مسجل في هذه الدورة بالفعل',
        ApiErrors.DUPLICATE_ERROR.status
      );
    }

    // Check if there's already a pending payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: 'PENDING'
      }
    });

    if (existingPayment) {
      return createErrorResponse(
        'PENDING_PAYMENT',
        'لديك عملية دفع معلقة لهذه الدورة بالفعل',
        409
      );
    }

    // Prevent professors from buying their own courses
    if (course.professorId === session.user.id) {
      return createErrorResponse(
        'INVALID_PURCHASE',
        'لا يمكنك شراء دورتك الخاصة',
        400
      );
    }

    // Get user information for billing
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true
      }
    });

    if (!user) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        'بيانات المستخدم غير موجودة',
        ApiErrors.NOT_FOUND.status
      );
    }

    // Create payment record in database
    const merchantOrderId = payMobService.generateMerchantOrderId(courseId, session.user.id);
    const amountCents = payMobService.formatAmount(Number(course.price));

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: course.price,
        currency: course.currency,
        status: 'PENDING',
        paymobOrderId: merchantOrderId
      }
    });

    // Prepare PayMob order data
    const billingData = payMobService.createBillingData(user);
    const orderData = {
      amount_cents: amountCents,
      currency: course.currency,
      merchant_order_id: merchantOrderId,
      items: [
        {
          name: course.title,
          amount_cents: amountCents,
          description: `دورة ${course.title} - ${course.category.name}`,
          quantity: 1
        }
      ],
      billing_data: billingData
    };

    // Initiate payment with PayMob
    const paymentResult = await payMobService.initiatePayment(orderData);

    // Update payment record with PayMob order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymobOrderId: paymentResult.orderId.toString(),
        paymobResponse: {
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          iframeUrl: paymentResult.iframeUrl,
          initiatedAt: new Date().toISOString()
        }
      }
    });

    return createSuccessResponse({
      paymentId: payment.id,
      paymentKey: paymentResult.paymentKey,
      iframeUrl: paymentResult.iframeUrl,
      orderId: paymentResult.orderId,
      amount: Number(course.price),
      currency: course.currency,
      course: {
        id: course.id,
        title: course.title,
        thumbnailUrl: course.thumbnailUrl,
        professor: course.professor.name
      }
    }, 201);

  } catch (error) {
    console.error('Payment initiation error:', error);
    
    // Handle PayMob specific errors
    if (error instanceof Error && error.message.includes('PayMob')) {
      return createErrorResponse(
        'PAYMENT_GATEWAY_ERROR',
        'حدث خطأ في نظام الدفع. يرجى المحاولة مرة أخرى.',
        502
      );
    }

    return createErrorResponse(
      ApiErrors.INTERNAL_ERROR.code,
      ApiErrors.INTERNAL_ERROR.message,
      ApiErrors.INTERNAL_ERROR.status,
      error
    );
  }
}