// src/app/api/payments/initiate/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { payMobService } from "@/lib/paymob/client";
import {
  createSuccessResponse,
  createErrorResponse,
  ApiErrors,
} from "@/lib/api-utils";
import { z } from "zod";
import {
  createStandardErrorResponse,
  API_ERROR_CODES,
  getErrorMessage,
} from "@/lib/api-error-handler";
import { paymobConfig } from '@/lib/paymob/config';


// Validation schema for payment initiation
const paymentInitiateSchema = z.object({
  courseId: z.string().min(1, "معرف الدورة مطلوب"),
  paymentMethod: z.enum(["credit-card", "e-wallet"]).default("credit-card"),
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
    if (!["STUDENT", "ADMIN"].includes(session.user.role)) {
      return createErrorResponse(
        ApiErrors.FORBIDDEN.code,
        "غير مصرح لك بإجراء عمليات الدفع",
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
        validationResult.error.issues
      );
    }

    const { courseId, paymentMethod } = validationResult.data;

    // Check if course exists and is published
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
      },
      include: {
        professor: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!course) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        "الدورة غير موجودة أو غير منشورة",
        ApiErrors.NOT_FOUND.status
      );
    }

    // Check if course is paid
    if (!course.price || Number(course.price) <= 0) {
      return createErrorResponse(
        "FREE_COURSE",
        "هذه الدورة مجانية ولا تحتاج لدفع",
        400
      );
    }

    // Check if user is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      return createErrorResponse(
        ApiErrors.DUPLICATE_ERROR.code,
        "أنت مسجل في هذه الدورة بالفعل",
        ApiErrors.DUPLICATE_ERROR.status
      );
    }

    // Check if there's already a pending payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId: session.user.id,
        courseId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingPayment) {
      const { isPaymentExpired, getPaymentTimeRemaining } = await import(
        "@/lib/services/payment-timeout.service"
      );

      if (isPaymentExpired(existingPayment.createdAt)) {
        // Cancel the old payment and allow new one
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: "CANCELLED",
            failureReason: `Payment abandoned - exceeded ${paymobConfig.abandonedPaymentCleanupMinutes} minute limit`,
            updatedAt: new Date(),
          },
        });

        console.log("Cancelled abandoned payment:", existingPayment.id);
      } else {
        // Payment is recent, return error with remaining time info
        const timeRemaining = getPaymentTimeRemaining(
          existingPayment.createdAt
        );

        return createErrorResponse(
          "PENDING_PAYMENT",
          `لديك عملية دفع معلقة لهذه الدورة بالفعل. الوقت المتبقي: ${timeRemaining.minutes} دقيقة و ${timeRemaining.seconds} ثانية`,
          409,
          {
            paymentId: existingPayment.id,
            createdAt: existingPayment.createdAt,
            expiresAt: new Date(
              existingPayment.createdAt.getTime() +
                paymobConfig.paymentTimeoutMinutes * 60 * 1000
            ),
            timeRemaining: timeRemaining,
            canCancel: true,
          }
        );
      }
    }

    // Prevent professors from buying their own courses
    if (course.professorId === session.user.id) {
      return createErrorResponse(
        "INVALID_PURCHASE",
        "لا يمكنك شراء دورتك الخاصة",
        400
      );
    }

    // Get user information for billing
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return createErrorResponse(
        ApiErrors.NOT_FOUND.code,
        "بيانات المستخدم غير موجودة",
        ApiErrors.NOT_FOUND.status
      );
    }

    // Create payment record in database
    const merchantOrderId = payMobService.generateMerchantOrderId(
      courseId,
      session.user.id
    );
    const amountCents = payMobService.formatAmount(Number(course.price));

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        courseId,
        amount: course.price,
        currency: course.currency,
        status: "PENDING",
        paymobOrderId: merchantOrderId,
      },
    });

    // Prepare PayMob order data
    const billingData = payMobService.createBillingData({
      name: user.name,
      email: user.email || undefined,
      phone: user.phone,
    });
    const orderData = {
      amount_cents: amountCents,
      currency: course.currency,
      merchant_order_id: merchantOrderId,
      items: [
        {
          name: course.title,
          amount_cents: amountCents,
          description: `دورة ${course.title} - ${course.category.name}`,
          quantity: 1,
        },
      ],
      billing_data: billingData,
    };

    // Initiate payment with PayMob
    const paymentResult = await payMobService.initiatePayment(
      orderData,
      courseId,
      paymentMethod
    );

    // Update payment record with PayMob order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymobOrderId: paymentResult.orderId.toString(),
        paymobResponse: {
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          iframeUrl: paymentResult.iframeUrl,
          initiatedAt: new Date().toISOString(),
        },
      },
    });

    return createSuccessResponse(
      {
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
          professor: course.professor.name,
        },
      },
      201
    );
  } catch (error) {
    console.error("Payment initiation error:", error);

    // Handle PayMob specific errors
    // Handle PayMob specific errors
    if (error instanceof Error && error.message.includes("PayMob")) {
      return createStandardErrorResponse(
        API_ERROR_CODES.PAYMENT_GATEWAY_ERROR,
        getErrorMessage(API_ERROR_CODES.PAYMENT_GATEWAY_ERROR),
        502,
        {
          originalError: error.message,
          gateway: "PayMob",
          timestamp: new Date().toISOString(),
        }
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
