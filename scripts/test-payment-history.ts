// scripts/test-payment-history.ts
// Test payment history and tracking features

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPaymentHistoryFeatures() {
  console.log('🔍 Testing payment history and tracking features...');
  
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
    
    // Get student's payment history
    const payments = await prisma.payment.findMany({
      where: { userId: student.id },
      include: {
        course: {
          select: {
            title: true
          }
        },
        webhooks: {
          select: {
            id: true,
            paymobTransactionId: true,
            processedAt: true,
            processingAttempts: true,
            lastError: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📊 Payment History Summary:');
    console.log('Total payments:', payments.length);
    
    if (payments.length === 0) {
      console.log('⚠️ No payments found for this student');
      return;
    }
    
    // Analyze payment statuses
    const statusCounts = payments.reduce((acc: any, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Payment status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Calculate statistics
    const completedPayments = payments.filter(p => p.status === 'COMPLETED');
    const totalSpent = completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const averageOrderValue = completedPayments.length > 0 ? totalSpent / completedPayments.length : 0;
    
    console.log('📈 Payment Statistics:');
    console.log('Total spent:', totalSpent, 'EGP');
    console.log('Successful payments:', completedPayments.length);
    console.log('Average order value:', averageOrderValue.toFixed(2), 'EGP');
    console.log('Success rate:', payments.length > 0 ? ((completedPayments.length / payments.length) * 100).toFixed(1) + '%' : '0%');
    
    // Show recent payments with details
    console.log('🔍 Recent Payments (last 5):');
    const recentPayments = payments.slice(0, 5);
    
    recentPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment.id}`);
      console.log(`   Course: ${payment.course.title}`);
      console.log(`   Amount: ${payment.amount} ${payment.currency}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Created: ${payment.createdAt.toISOString()}`);
      
      if (payment.completedAt) {
        console.log(`   Completed: ${payment.completedAt.toISOString()}`);
      }
      
      if (payment.failureReason) {
        console.log(`   Failure reason: ${payment.failureReason}`);
      }
      
      if (payment.paymobTransactionId) {
        console.log(`   PayMob Transaction ID: ${payment.paymobTransactionId}`);
      }
      
      if (payment.webhooks.length > 0) {
        console.log(`   Webhooks processed: ${payment.webhooks.length}`);
        payment.webhooks.forEach((webhook, wIndex) => {
          console.log(`     ${wIndex + 1}. Processed: ${webhook.processedAt?.toISOString()}`);
          console.log(`        Attempts: ${webhook.processingAttempts}`);
          if (webhook.lastError) {
            console.log(`        Last error: ${webhook.lastError}`);
          }
        });
      }
    });
    
    // Test monthly spending calculation
    console.log('\n📅 Monthly Spending (last 6 months):');
    const monthlySpending = [];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate >= monthStart && paymentDate <= monthEnd && payment.status === 'COMPLETED';
      });

      const monthAmount = monthPayments.reduce((sum, payment) => sum + Number(payment.amount), 0);

      const monthData = {
        month: date.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
        amount: monthAmount,
        transactions: monthPayments.length
      };
      
      monthlySpending.push(monthData);
      console.log(`  ${monthData.month}: ${monthData.amount} EGP (${monthData.transactions} transactions)`);
    }
    
    // Test payment method statistics
    console.log('\n💳 Payment Methods:');
    const paymentMethodsMap = new Map();
    
    completedPayments.forEach(payment => {
      const method = payment.paymentMethod || 'credit_card';
      if (!paymentMethodsMap.has(method)) {
        paymentMethodsMap.set(method, { count: 0, totalAmount: 0 });
      }
      const methodData = paymentMethodsMap.get(method);
      methodData.count++;
      methodData.totalAmount += Number(payment.amount);
    });

    Array.from(paymentMethodsMap.entries()).forEach(([method, data]) => {
      const percentage = completedPayments.length > 0 ? (data.count / completedPayments.length) * 100 : 0;
      console.log(`  ${method}: ${data.count} transactions, ${data.totalAmount} EGP (${percentage.toFixed(1)}%)`);
    });
    
    console.log('\n🎉 Payment history and tracking test completed!');
    console.log('📋 Features tested:');
    console.log('- Payment history retrieval ✅');
    console.log('- Status breakdown ✅');
    console.log('- Payment statistics ✅');
    console.log('- Monthly spending analysis ✅');
    console.log('- Payment method statistics ✅');
    console.log('- Webhook tracking ✅');
    console.log('- Transaction details ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentHistoryFeatures();