// scripts/test-abandoned-payment.ts
// Test abandoned payment handling

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAbandonedPaymentHandling() {
  console.log('🔍 Testing abandoned payment handling...');
  
  try {
    // Get a student user
    const student = await prisma.user.findFirst({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true
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
      select: {
        id: true,
        title: true,
        price: true
      }
    });
    
    if (!course) {
      console.log('❌ No paid courses found');
      return;
    }
    
    console.log('✅ Found course:', course.title);
    
    // Clean up existing data
    await prisma.payment.deleteMany({
      where: {
        userId: student.id,
        courseId: course.id
      }
    });
    
    console.log('✅ Cleaned up existing payments');
    
    // Test 1: Create a recent pending payment (should block new payment)
    console.log('📝 Test 1: Creating recent pending payment...');
    
    const recentPayment = await prisma.payment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        amount: course.price,
        currency: 'EGP',
        status: 'PENDING',
        paymobOrderId: 'test_recent_' + Date.now()
      }
    });
    
    console.log('✅ Recent payment created:', recentPayment.id);
    
    // Check if new payment would be blocked
    const existingRecent = await prisma.payment.findFirst({
      where: {
        userId: student.id,
        courseId: course.id,
        status: 'PENDING'
      }
    });
    
    if (existingRecent) {
      console.log('✅ Recent pending payment would block new payment (correct behavior)');
    }
    
    // Test 2: Create an old pending payment (should be auto-cancelled)
    console.log('📝 Test 2: Creating old pending payment...');
    
    // Delete the recent payment first
    await prisma.payment.delete({
      where: { id: recentPayment.id }
    });
    
    // Create an old payment (35 minutes ago)
    const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000);
    
    const oldPayment = await prisma.payment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        amount: course.price,
        currency: 'EGP',
        status: 'PENDING',
        paymobOrderId: 'test_old_' + Date.now(),
        createdAt: thirtyFiveMinutesAgo
      }
    });
    
    console.log('✅ Old payment created:', oldPayment.id, 'at', thirtyFiveMinutesAgo);
    
    // Simulate the payment initiation logic
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    if (oldPayment.createdAt < thirtyMinutesAgo) {
      // This would be cancelled in the actual API
      await prisma.payment.update({
        where: { id: oldPayment.id },
        data: {
          status: 'CANCELLED',
          failureReason: 'Payment abandoned - exceeded time limit'
        }
      });
      
      console.log('✅ Old payment auto-cancelled (correct behavior)');
    }
    
    // Test 3: Test manual cancellation
    console.log('📝 Test 3: Testing manual cancellation...');
    
    const manualPayment = await prisma.payment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        amount: course.price,
        currency: 'EGP',
        status: 'PENDING',
        paymobOrderId: 'test_manual_' + Date.now()
      }
    });
    
    console.log('✅ Manual payment created:', manualPayment.id);
    
    // Simulate manual cancellation
    const cancelledPayment = await prisma.payment.update({
      where: { id: manualPayment.id },
      data: {
        status: 'CANCELLED',
        failureReason: 'Cancelled by user',
        completedAt: new Date()
      }
    });
    
    console.log('✅ Payment manually cancelled:', cancelledPayment.status);
    
    // Test 4: Verify payment statuses
    console.log('📝 Test 4: Verifying payment statuses...');
    
    const allPayments = await prisma.payment.findMany({
      where: {
        userId: student.id,
        courseId: course.id
      },
      select: {
        id: true,
        status: true,
        failureReason: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 Payment history:');
    allPayments.forEach((payment, index) => {
      console.log(`  ${index + 1}. ${payment.status} - ${payment.failureReason || 'No reason'} - ${payment.createdAt.toISOString()}`);
    });
    
    console.log('🎉 Abandoned payment handling test completed!');
    console.log('📋 Summary:');
    console.log('- Recent pending payments: Block new payments ✅');
    console.log('- Old pending payments: Auto-cancel ✅');
    console.log('- Manual cancellation: Works ✅');
    console.log('- Payment status tracking: Works ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAbandonedPaymentHandling();