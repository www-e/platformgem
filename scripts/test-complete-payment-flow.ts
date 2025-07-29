// scripts/test-complete-payment-flow.ts
// Test the complete payment flow with webhook simulation

import { PrismaClient } from '@prisma/client';
import { payMobService } from '../src/lib/paymob';
import fetch from 'node-fetch';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function testCompletePaymentFlow() {
  console.log('🔍 Testing complete payment flow with webhook simulation...');
  
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
    
    // Clean up existing data
    await prisma.enrollment.deleteMany({
      where: {
        userId: student.id,
        courseId: course.id
      }
    });
    
    await prisma.paymentWebhook.deleteMany({
      where: {
        payment: {
          userId: student.id,
          courseId: course.id
        }
      }
    });
    
    await prisma.payment.deleteMany({
      where: {
        userId: student.id,
        courseId: course.id
      }
    });
    
    console.log('✅ Cleaned up existing data');
    
    // Step 1: Initiate payment
    console.log('💳 Step 1: Initiating payment...');
    
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
    
    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        amount: course.price,
        currency: course.currency,
        status: 'PENDING',
        paymobOrderId: merchantOrderId
      }
    });
    
    console.log('✅ Payment record created:', payment.id);
    
    // Initiate payment with PayMob
    const paymentResult = await payMobService.initiatePayment(orderData, course.id);
    
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
    
    console.log('✅ Payment initiated with PayMob');
    console.log('Payment Key length:', paymentResult.paymentKey.length);
    console.log('Order ID:', paymentResult.orderId);
    console.log('Iframe URL includes return URL:', paymentResult.iframeUrl.includes('return_url'));
    
    // Step 2: Simulate successful webhook
    console.log('🔗 Step 2: Simulating successful webhook...');
    
    const webhookPayload = {
      id: 999999999, // Fake transaction ID
      pending: false,
      amount_cents: amountCents,
      success: true,
      is_auth: false,
      is_capture: true,
      is_refunded: false,
      is_standalone_payment: true,
      is_voided: false,
      integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD || '0'),
      order_id: paymentResult.orderId,
      order: {
        id: paymentResult.orderId,
        merchant_order_id: merchantOrderId,
        amount_cents: amountCents,
        currency: course.currency
      },
      created_at: new Date().toISOString(),
      currency: course.currency,
      error_occured: false,
      has_parent_transaction: false,
      is_3d_secure: true,
      owner: 123456,
      source_data_pan: '409000xxxxxx3626',
      source_data_type: 'card',
      source_data_sub_type: 'MasterCard'
    };
    
    // Generate valid HMAC for webhook
    const concatenatedString = [
      webhookPayload.amount_cents,
      webhookPayload.created_at,
      webhookPayload.currency,
      webhookPayload.error_occured,
      webhookPayload.has_parent_transaction,
      webhookPayload.id,
      webhookPayload.integration_id,
      webhookPayload.is_3d_secure,
      webhookPayload.is_auth,
      webhookPayload.is_capture,
      webhookPayload.is_refunded,
      webhookPayload.is_standalone_payment,
      webhookPayload.is_voided,
      webhookPayload.order_id,
      webhookPayload.owner,
      webhookPayload.pending,
      webhookPayload.source_data_pan,
      webhookPayload.source_data_sub_type,
      webhookPayload.source_data_type,
      webhookPayload.success
    ].join('');
    
    const hmac = crypto
      .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET)
      .update(concatenatedString)
      .digest('hex');
    
    const webhookPayloadWithHmac = {
      ...webhookPayload,
      hmac
    };
    
    // Send webhook to our API
    const webhookResponse = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayloadWithHmac),
    });
    
    const webhookResult = await webhookResponse.json();
    console.log('Webhook response status:', webhookResponse.status);
    console.log('Webhook response:', webhookResult);
    
    // Step 3: Verify payment status
    console.log('✅ Step 3: Verifying payment status...');
    
    const updatedPayment = await prisma.payment.findUnique({
      where: { id: payment.id },
      include: {
        webhooks: true
      }
    });
    
    console.log('Updated payment status:', updatedPayment?.status);
    console.log('Payment completed at:', updatedPayment?.completedAt);
    console.log('PayMob transaction ID:', updatedPayment?.paymobTransactionId ? Number(updatedPayment.paymobTransactionId) : null);
    console.log('Webhooks created:', updatedPayment?.webhooks.length);
    
    // Step 4: Check enrollment
    console.log('🎓 Step 4: Checking enrollment...');
    
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id
        }
      }
    });
    
    if (enrollment) {
      console.log('✅ Enrollment created successfully!');
      console.log('Enrollment ID:', enrollment.id);
      console.log('Enrolled at:', enrollment.enrolledAt);
    } else {
      console.log('❌ Enrollment not created');
    }
    
    console.log('🎉 Complete payment flow test completed!');
    console.log('📋 Summary:');
    console.log('- Student:', student.name);
    console.log('- Course:', course.title);
    console.log('- Payment Status:', updatedPayment?.status);
    console.log('- Enrollment Created:', !!enrollment);
    console.log('- Webhook Processed:', updatedPayment?.webhooks.length || 0, 'times');
    
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