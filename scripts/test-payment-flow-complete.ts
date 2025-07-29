// scripts/test-payment-flow-complete.ts
// Test complete payment flow with authentication

import { PrismaClient } from '@prisma/client';
import { payMobService } from '../src/lib/paymob';

const prisma = new PrismaClient();

async function testCompletePaymentFlow() {
  console.log('🔍 Testing complete payment flow...');
  
  try {
    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    });
    
    if (!student) {
      console.log('❌ No student users found');
      return;
    }
    
    console.log('✅ Found student:', student.name);
    
    // Get a paid course
    const course = await prisma.course.findFirst({
      where: { 
        isPublished: true,
        price: { gt: 0 }
      },
      include: {
        professor: {
          select: {
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
      console.log('❌ No paid courses found');
      return;
    }
    
    console.log('✅ Found course:', course.title, 'Price:', course.price);
    
    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id
        }
      }
    });
    
    if (existingEnrollment) {
      console.log('⚠️ Student already enrolled, cleaning up...');
      await prisma.enrollment.delete({
        where: { id: existingEnrollment.id }
      });
    }
    
    // Clean up any existing payments
    await prisma.payment.deleteMany({
      where: {
        userId: student.id,
        courseId: course.id
      }
    });
    
    console.log('✅ Cleaned up existing data');
    
    // Test PayMob service directly
    console.log('🔐 Testing PayMob service...');
    
    const merchantOrderId = payMobService.generateMerchantOrderId(course.id, student.id);
    const amountCents = payMobService.formatAmount(Number(course.price));
    
    const billingData = payMobService.createBillingData({
      name: student.name,
      email: student.email || undefined,
      phone: student.phone
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
          quantity: 1
        }
      ],
      billing_data: billingData
    };
    
    console.log('📦 Order data prepared:', {
      amount_cents: amountCents,
      currency: course.currency,
      merchant_order_id: merchantOrderId
    });
    
    // Test payment initiation
    const paymentResult = await payMobService.initiatePayment(orderData);
    
    console.log('✅ Payment initiated successfully!');
    console.log('Payment Key length:', paymentResult.paymentKey.length);
    console.log('Order ID:', paymentResult.orderId);
    console.log('Iframe URL:', paymentResult.iframeUrl.substring(0, 100) + '...');
    
    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        amount: course.price,
        currency: course.currency,
        status: 'PENDING',
        paymobOrderId: paymentResult.orderId.toString(),
        paymobResponse: {
          paymentKey: paymentResult.paymentKey,
          orderId: paymentResult.orderId,
          iframeUrl: paymentResult.iframeUrl,
          initiatedAt: new Date().toISOString()
        }
      }
    });
    
    console.log('✅ Payment record created in database:', payment.id);
    
    console.log('🎉 Complete payment flow test passed!');
    console.log('📋 Summary:');
    console.log('- Student:', student.name);
    console.log('- Course:', course.title);
    console.log('- Amount:', course.price, course.currency);
    console.log('- Payment ID:', payment.id);
    console.log('- PayMob Order ID:', paymentResult.orderId);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testCompletePaymentFlow();