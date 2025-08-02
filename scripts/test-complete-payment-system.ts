// scripts/test-complete-payment-system.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

interface TestResults {
  passed: number;
  failed: number;
  errors: string[];
}

class PaymentSystemTester {
  private results: TestResults = { passed: 0, failed: 0, errors: [] };
  private baseUrl = 'http://localhost:3000';
  private testUserId: string = '';
  private testCourseId: string = '';
  private testPaymentId: string = '';
  private testWebhookId: string = '';
  private adminCookie: string = '';
  private studentCookie: string = '';

  async runAllTests() {
    console.log('🚀 Starting Complete Payment System Tests...\n');

    try {
      await this.setupTestData();
      await this.authenticateUsers();
      
      // Core Payment Flow Tests
      await this.testPaymentInitiation();
      await this.testPaymentProcessing();
      await this.testWebhookProcessing();
      await this.testEnrollmentCreation();
      
      // Admin Interface Tests
      await this.testAdminPaymentManagement();
      await this.testPaymentFiltering();
      await this.testPaymentSearch();
      await this.testPaymentPagination();
      await this.testPaymentStatistics();
      await this.testPaymentActions();
      
      // Student Interface Tests
      await this.testStudentPaymentHistory();
      await this.testPaymentDetailsModal();
      
      // Webhook Advanced Tests
      await this.testWebhookIdempotency();
      await this.testWebhookSignatureVerification();
      await this.testWebhookPayloadValidation();
      await this.testWebhookErrorHandling();
      await this.testWebhookRetry();
      
      // Edge Cases and Error Handling
      await this.testPaymentCancellation();
      await this.testPaymentRetry();
      await this.testPaymentStatusUpdates();
      await this.testPaymentExport();
      
      await this.cleanupTestData();
      
    } catch (error) {
      this.logError('Test suite failed', error);
    }

    this.printResults();
  }

  private async setupTestData() {
    console.log('📋 Setting up test data...');
    
    try {
      // Create test category
      const category = await prisma.category.create({
        data: {
          name: 'Test Category',
          description: 'Test category for payment testing'
        }
      });

      // Create test professor
      const professor = await prisma.user.create({
        data: {
          email: 'test-professor@example.com',
          name: 'Test Professor',
          password: 'hashedpassword',
          role: 'PROFESSOR',
          isActive: true
        }
      });

      // Create test student
      const student = await prisma.user.create({
        data: {
          email: 'test-student@example.com',
          name: 'Test Student',
          password: 'hashedpassword',
          role: 'STUDENT',
          isActive: true
        }
      });

      this.testUserId = student.id;

      // Create test course
      const course = await prisma.course.create({
        data: {
          title: 'Test Course for Payment',
          description: 'A test course for payment flow testing',
          shortDescription: 'Test course',
          price: 100.00,
          currency: 'EGP',
          categoryId: category.id,
          professorId: professor.id,
          isPublished: true,
          thumbnailUrl: 'https://example.com/test.jpg'
        }
      });

      this.testCourseId = course.id;
      
      this.logSuccess('Test data setup completed');
    } catch (error) {
      this.logError('Failed to setup test data', error);
    }
  }

  private async authenticateUsers() {
    console.log('🔐 Authenticating test users...');
    
    try {
      // Create admin user for testing
      const admin = await prisma.user.create({
        data: {
          email: 'test-admin@example.com',
          name: 'Test Admin',
          password: 'hashedpassword',
          role: 'ADMIN',
          isActive: true
        }
      });

      // Simulate authentication cookies (in real scenario, these would come from login)
      this.adminCookie = 'admin-session-token';
      this.studentCookie = 'student-session-token';
      
      this.logSuccess('User authentication completed');
    } catch (error) {
      this.logError('Failed to authenticate users', error);
    }
  }

  private async testPaymentInitiation() {
    console.log('💳 Testing payment initiation...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': this.studentCookie
        },
        body: JSON.stringify({
          courseId: this.testCourseId,
          amount: 100.00,
          currency: 'EGP'
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.paymentId) {
        this.testPaymentId = result.data.paymentId;
        this.logSuccess('Payment initiation successful');
      } else {
        this.logError('Payment initiation failed', result);
      }
    } catch (error) {
      this.logError('Payment initiation request failed', error);
    }
  }

  private async testPaymentProcessing() {
    console.log('⚡ Testing payment processing...');
    
    try {
      // Simulate PayMob payment processing
      const paymobResponse = {
        id: 'paymob_' + Date.now(),
        amount_cents: 10000,
        currency: 'EGP',
        success: true,
        pending: false,
        refunded: false,
        order: {
          merchant_order_id: this.testPaymentId
        },
        source_data: {
          type: 'card',
          pan: '****1234'
        }
      };

      // Update payment status to processing
      await prisma.payment.update({
        where: { id: this.testPaymentId },
        data: {
          status: 'PROCESSING',
          paymobTransactionId: paymobResponse.id,
          paymentMethod: 'CARD'
        }
      });

      this.logSuccess('Payment processing simulation completed');
    } catch (error) {
      this.logError('Payment processing failed', error);
    }
  }

  private async testWebhookProcessing() {
    console.log('🔗 Testing webhook processing...');
    
    try {
      const webhookPayload = {
        type: 'TRANSACTION',
        obj: {
          id: 'paymob_' + Date.now(),
          amount_cents: 10000,
          currency: 'EGP',
          success: true,
          pending: false,
          refunded: false,
          order: {
            merchant_order_id: this.testPaymentId
          },
          source_data: {
            type: 'card',
            pan: '****1234'
          }
        }
      };

      // Generate HMAC signature
      const hmacSecret = process.env.PAYMOB_HMAC_SECRET || 'test-secret';
      const signature = crypto
        .createHmac('sha512', hmacSecret)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      const response = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': signature
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await response.json();
      
      if (result.success) {
        this.logSuccess('Webhook processing successful');
        
        // Verify payment status was updated
        const payment = await prisma.payment.findUnique({
          where: { id: this.testPaymentId }
        });
        
        if (payment?.status === 'COMPLETED') {
          this.logSuccess('Payment status updated to COMPLETED');
        } else {
          this.logError('Payment status not updated correctly', { status: payment?.status });
        }
      } else {
        this.logError('Webhook processing failed', result);
      }
    } catch (error) {
      this.logError('Webhook processing request failed', error);
    }
  }

  private async testEnrollmentCreation() {
    console.log('📚 Testing enrollment creation...');
    
    try {
      // Check if enrollment was created after successful payment
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: this.testUserId,
          courseId: this.testCourseId
        }
      });

      if (enrollment) {
        this.logSuccess('Enrollment created successfully');
        
        // Verify enrollment details
        if (enrollment.status === 'ACTIVE' && enrollment.paymentId === this.testPaymentId) {
          this.logSuccess('Enrollment details are correct');
        } else {
          this.logError('Enrollment details incorrect', enrollment);
        }
      } else {
        this.logError('Enrollment not created', null);
      }
    } catch (error) {
      this.logError('Enrollment verification failed', error);
    }
  }

  private async testAdminPaymentManagement() {
    console.log('👨‍💼 Testing admin payment management interface...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/payments`, {
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        this.logSuccess('Admin payment list retrieved');
        
        // Check if our test payment is in the list
        const testPayment = result.data.find((p: any) => p.id === this.testPaymentId);
        if (testPayment) {
          this.logSuccess('Test payment found in admin list');
        } else {
          this.logError('Test payment not found in admin list', null);
        }
      } else {
        this.logError('Admin payment list retrieval failed', result);
      }
    } catch (error) {
      this.logError('Admin payment management request failed', error);
    }
  }

  private async testPaymentFiltering() {
    console.log('🔍 Testing payment filtering...');
    
    try {
      const filters = [
        { status: 'COMPLETED' },
        { status: 'PENDING' },
        { status: 'FAILED' },
        { dateFrom: '2024-01-01' },
        { dateTo: '2024-12-31' }
      ];

      for (const filter of filters) {
        const queryParams = new URLSearchParams(filter).toString();
        const response = await fetch(`${this.baseUrl}/api/admin/payments?${queryParams}`, {
          headers: {
            'Cookie': this.adminCookie
          }
        });

        const result = await response.json();
        
        if (result.success) {
          this.logSuccess(`Payment filtering by ${Object.keys(filter)[0]} successful`);
        } else {
          this.logError(`Payment filtering by ${Object.keys(filter)[0]} failed`, result);
        }
      }
    } catch (error) {
      this.logError('Payment filtering test failed', error);
    }
  }

  private async testPaymentSearch() {
    console.log('🔎 Testing payment search...');
    
    try {
      const searchTerms = ['test', 'student', this.testPaymentId.substring(0, 8)];

      for (const term of searchTerms) {
        const response = await fetch(`${this.baseUrl}/api/admin/payments?search=${encodeURIComponent(term)}`, {
          headers: {
            'Cookie': this.adminCookie
          }
        });

        const result = await response.json();
        
        if (result.success) {
          this.logSuccess(`Payment search for "${term}" successful`);
        } else {
          this.logError(`Payment search for "${term}" failed`, result);
        }
      }
    } catch (error) {
      this.logError('Payment search test failed', error);
    }
  }

  private async testPaymentPagination() {
    console.log('📄 Testing payment pagination...');
    
    try {
      const paginationTests = [
        { page: 1, limit: 10 },
        { page: 2, limit: 5 },
        { page: 1, limit: 20 }
      ];

      for (const { page, limit } of paginationTests) {
        const response = await fetch(`${this.baseUrl}/api/admin/payments?page=${page}&limit=${limit}`, {
          headers: {
            'Cookie': this.adminCookie
          }
        });

        const result = await response.json();
        
        if (result.success && result.pagination) {
          this.logSuccess(`Payment pagination (page ${page}, limit ${limit}) successful`);
        } else {
          this.logError(`Payment pagination (page ${page}, limit ${limit}) failed`, result);
        }
      }
    } catch (error) {
      this.logError('Payment pagination test failed', error);
    }
  }

  private async testPaymentStatistics() {
    console.log('📊 Testing payment statistics...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/payments/stats`, {
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const stats = result.data;
        if (typeof stats.totalRevenue === 'number' && 
            typeof stats.totalPayments === 'number' &&
            typeof stats.completedPayments === 'number') {
          this.logSuccess('Payment statistics retrieved successfully');
        } else {
          this.logError('Payment statistics format incorrect', stats);
        }
      } else {
        this.logError('Payment statistics retrieval failed', result);
      }
    } catch (error) {
      this.logError('Payment statistics test failed', error);
    }
  }

  private async testPaymentActions() {
    console.log('⚙️ Testing payment actions...');
    
    try {
      // Test manual completion
      const completeResponse = await fetch(`${this.baseUrl}/api/admin/payments/${this.testPaymentId}/complete`, {
        method: 'POST',
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const completeResult = await completeResponse.json();
      
      if (completeResult.success) {
        this.logSuccess('Manual payment completion successful');
      } else {
        this.logError('Manual payment completion failed', completeResult);
      }

      // Test retry enrollment
      const retryResponse = await fetch(`${this.baseUrl}/api/admin/payments/${this.testPaymentId}/retry-enrollment`, {
        method: 'POST',
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const retryResult = await retryResponse.json();
      
      if (retryResult.success) {
        this.logSuccess('Payment enrollment retry successful');
      } else {
        this.logError('Payment enrollment retry failed', retryResult);
      }
    } catch (error) {
      this.logError('Payment actions test failed', error);
    }
  }

  private async testStudentPaymentHistory() {
    console.log('👨‍🎓 Testing student payment history...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/student/payments`, {
        headers: {
          'Cookie': this.studentCookie
        }
      });

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        this.logSuccess('Student payment history retrieved');
        
        const testPayment = result.data.find((p: any) => p.id === this.testPaymentId);
        if (testPayment) {
          this.logSuccess('Test payment found in student history');
        } else {
          this.logError('Test payment not found in student history', null);
        }
      } else {
        this.logError('Student payment history retrieval failed', result);
      }
    } catch (error) {
      this.logError('Student payment history test failed', error);
    }
  }

  private async testPaymentDetailsModal() {
    console.log('🔍 Testing payment details modal...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/${this.testPaymentId}`, {
        headers: {
          'Cookie': this.studentCookie
        }
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        const payment = result.data;
        if (payment.id === this.testPaymentId && payment.amount && payment.status) {
          this.logSuccess('Payment details retrieved successfully');
        } else {
          this.logError('Payment details incomplete', payment);
        }
      } else {
        this.logError('Payment details retrieval failed', result);
      }
    } catch (error) {
      this.logError('Payment details modal test failed', error);
    }
  }

  private async testWebhookIdempotency() {
    console.log('🔄 Testing webhook idempotency...');
    
    try {
      const webhookPayload = {
        type: 'TRANSACTION',
        obj: {
          id: 'duplicate_test_' + Date.now(),
          amount_cents: 5000,
          currency: 'EGP',
          success: true,
          pending: false,
          refunded: false,
          order: {
            merchant_order_id: this.testPaymentId
          }
        }
      };

      const hmacSecret = process.env.PAYMOB_HMAC_SECRET || 'test-secret';
      const signature = crypto
        .createHmac('sha512', hmacSecret)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      // Send the same webhook twice
      const response1 = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': signature
        },
        body: JSON.stringify(webhookPayload)
      });

      const response2 = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': signature
        },
        body: JSON.stringify(webhookPayload)
      });

      const result1 = await response1.json();
      const result2 = await response2.json();
      
      if (result1.success && result2.success) {
        this.logSuccess('Webhook idempotency test passed');
      } else {
        this.logError('Webhook idempotency test failed', { result1, result2 });
      }
    } catch (error) {
      this.logError('Webhook idempotency test failed', error);
    }
  }

  private async testWebhookSignatureVerification() {
    console.log('🔐 Testing webhook signature verification...');
    
    try {
      const webhookPayload = {
        type: 'TRANSACTION',
        obj: {
          id: 'signature_test_' + Date.now(),
          amount_cents: 3000,
          currency: 'EGP',
          success: true
        }
      };

      // Test with invalid signature
      const invalidResponse = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': 'invalid-signature'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (invalidResponse.status === 401 || invalidResponse.status === 403) {
        this.logSuccess('Invalid signature correctly rejected');
      } else {
        this.logError('Invalid signature not rejected', { status: invalidResponse.status });
      }

      // Test with valid signature
      const hmacSecret = process.env.PAYMOB_HMAC_SECRET || 'test-secret';
      const validSignature = crypto
        .createHmac('sha512', hmacSecret)
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      const validResponse = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': validSignature
        },
        body: JSON.stringify(webhookPayload)
      });

      const validResult = await validResponse.json();
      
      if (validResult.success) {
        this.logSuccess('Valid signature correctly accepted');
      } else {
        this.logError('Valid signature rejected', validResult);
      }
    } catch (error) {
      this.logError('Webhook signature verification test failed', error);
    }
  }

  private async testWebhookPayloadValidation() {
    console.log('✅ Testing webhook payload validation...');
    
    try {
      const invalidPayloads = [
        {}, // Empty payload
        { type: 'INVALID' }, // Invalid type
        { type: 'TRANSACTION' }, // Missing obj
        { type: 'TRANSACTION', obj: {} }, // Empty obj
        { type: 'TRANSACTION', obj: { id: 'test' } } // Missing required fields
      ];

      for (const payload of invalidPayloads) {
        const signature = crypto
          .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET || 'test-secret')
          .update(JSON.stringify(payload))
          .digest('hex');

        const response = await fetch(`${this.baseUrl}/api/payments/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Paymob-Signature': signature
          },
          body: JSON.stringify(payload)
        });

        if (response.status >= 400) {
          this.logSuccess('Invalid payload correctly rejected');
        } else {
          this.logError('Invalid payload not rejected', payload);
        }
      }
    } catch (error) {
      this.logError('Webhook payload validation test failed', error);
    }
  }

  private async testWebhookErrorHandling() {
    console.log('❌ Testing webhook error handling...');
    
    try {
      // Create a webhook that will cause an error (non-existent payment)
      const webhookPayload = {
        type: 'TRANSACTION',
        obj: {
          id: 'error_test_' + Date.now(),
          amount_cents: 2000,
          currency: 'EGP',
          success: true,
          order: {
            merchant_order_id: 'non-existent-payment-id'
          }
        }
      };

      const signature = crypto
        .createHmac('sha512', process.env.PAYMOB_HMAC_SECRET || 'test-secret')
        .update(JSON.stringify(webhookPayload))
        .digest('hex');

      const response = await fetch(`${this.baseUrl}/api/payments/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Paymob-Signature': signature
        },
        body: JSON.stringify(webhookPayload)
      });

      const result = await response.json();
      
      if (!result.success && result.error) {
        this.logSuccess('Webhook error handling working correctly');
      } else {
        this.logError('Webhook error not handled properly', result);
      }
    } catch (error) {
      this.logError('Webhook error handling test failed', error);
    }
  }

  private async testWebhookRetry() {
    console.log('🔄 Testing webhook retry mechanism...');
    
    try {
      // Create a webhook record with failed status
      const webhook = await prisma.webhookEvent.create({
        data: {
          eventType: 'TRANSACTION',
          payload: { test: 'retry' },
          signature: 'test-signature',
          status: 'FAILED',
          processingAttempts: 2,
          lastError: 'Test error for retry',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      this.testWebhookId = webhook.id;

      // Test retry endpoint
      const response = await fetch(`${this.baseUrl}/api/admin/webhooks/${webhook.id}/retry`, {
        method: 'POST',
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const result = await response.json();
      
      if (result.success) {
        this.logSuccess('Webhook retry mechanism working');
        
        // Verify retry attempt was recorded
        const updatedWebhook = await prisma.webhookEvent.findUnique({
          where: { id: webhook.id }
        });
        
        if (updatedWebhook && updatedWebhook.processingAttempts > 2) {
          this.logSuccess('Webhook retry attempt recorded');
        } else {
          this.logError('Webhook retry attempt not recorded', updatedWebhook);
        }
      } else {
        this.logError('Webhook retry failed', result);
      }
    } catch (error) {
      this.logError('Webhook retry test failed', error);
    }
  }

  private async testPaymentCancellation() {
    console.log('❌ Testing payment cancellation...');
    
    try {
      // Create a pending payment for cancellation test
      const pendingPayment = await prisma.payment.create({
        data: {
          userId: this.testUserId,
          courseId: this.testCourseId,
          amount: 50.00,
          currency: 'EGP',
          status: 'PENDING',
          paymentMethod: 'CARD'
        }
      });

      const response = await fetch(`${this.baseUrl}/api/admin/payments/${pendingPayment.id}/cancel`, {
        method: 'POST',
        headers: {
          'Cookie': this.adminCookie
        }
      });

      const result = await response.json();
      
      if (result.success) {
        this.logSuccess('Payment cancellation successful');
        
        // Verify payment status was updated
        const cancelledPayment = await prisma.payment.findUnique({
          where: { id: pendingPayment.id }
        });
        
        if (cancelledPayment?.status === 'CANCELLED') {
          this.logSuccess('Payment status updated to CANCELLED');
        } else {
          this.logError('Payment status not updated to CANCELLED', cancelledPayment);
        }
      } else {
        this.logError('Payment cancellation failed', result);
      }
    } catch (error) {
      this.logError('Payment cancellation test failed', error);
    }
  }

  private async testPaymentRetry() {
    console.log('🔄 Testing payment retry...');
    
    try {
      // Create a failed payment for retry test
      const failedPayment = await prisma.payment.create({
        data: {
          userId: this.testUserId,
          courseId: this.testCourseId,
          amount: 75.00,
          currency: 'EGP',
          status: 'FAILED',
          paymentMethod: 'CARD',
          failureReason: 'Test failure for retry'
        }
      });

      const response = await fetch(`${this.baseUrl}/api/payments/${failedPayment.id}/retry`, {
        method: 'POST',
        headers: {
          'Cookie': this.studentCookie
        }
      });

      const result = await response.json();
      
      if (result.success) {
        this.logSuccess('Payment retry initiated successfully');
      } else {
        this.logError('Payment retry failed', result);
      }
    } catch (error) {
      this.logError('Payment retry test failed', error);
    }
  }

  private async testPaymentStatusUpdates() {
    console.log('🔄 Testing payment status updates...');
    
    try {
      const statusUpdates = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
      
      for (const status of statusUpdates) {
        const testPayment = await prisma.payment.create({
          data: {
            userId: this.testUserId,
            courseId: this.testCourseId,
            amount: 25.00,
            currency: 'EGP',
            status: 'PENDING',
            paymentMethod: 'CARD'
          }
        });

        const response = await fetch(`${this.baseUrl}/api/admin/payments/${testPayment.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': this.adminCookie
          },
          body: JSON.stringify({ status })
        });

        const result = await response.json();
        
        if (result.success) {
          this.logSuccess(`Payment status update to ${status} successful`);
        } else {
          this.logError(`Payment status update to ${status} failed`, result);
        }
      }
    } catch (error) {
      this.logError('Payment status updates test failed', error);
    }
  }

  private async testPaymentExport() {
    console.log('📊 Testing payment export...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/payments/export`, {
        headers: {
          'Cookie': this.adminCookie
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/csv')) {
          this.logSuccess('Payment export (CSV) successful');
        } else {
          this.logError('Payment export content type incorrect', { contentType });
        }
      } else {
        this.logError('Payment export failed', { status: response.status });
      }
    } catch (error) {
      this.logError('Payment export test failed', error);
    }
  }

  private async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Delete in correct order to handle foreign key constraints
      await prisma.enrollment.deleteMany({
        where: { userId: this.testUserId }
      });
      
      await prisma.payment.deleteMany({
        where: { userId: this.testUserId }
      });
      
      if (this.testWebhookId) {
        await prisma.webhookEvent.deleteMany({
          where: { id: this.testWebhookId }
        });
      }
      
      await prisma.course.deleteMany({
        where: { id: this.testCourseId }
      });
      
      await prisma.user.deleteMany({
        where: {
          email: {
            in: ['test-student@example.com', 'test-professor@example.com', 'test-admin@example.com']
          }
        }
      });
      
      await prisma.category.deleteMany({
        where: { name: 'Test Category' }
      });
      
      this.logSuccess('Test data cleanup completed');
    } catch (error) {
      this.logError('Test data cleanup failed', error);
    }
  }

  private logSuccess(message: string) {
    console.log(`✅ ${message}`);
    this.results.passed++;
  }

  private logError(message: string, error: any) {
    console.log(`❌ ${message}`);
    if (error) {
      console.log(`   Error details:`, error);
    }
    this.results.failed++;
    this.results.errors.push(message);
  }

  private printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PAYMENT SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    const successRate = (this.results.passed / (this.results.passed + this.results.failed)) * 100;
    console.log(`\n🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
    if (successRate >= 90) {
      console.log('🎉 Excellent! Payment system is working well.');
    } else if (successRate >= 70) {
      console.log('⚠️  Good, but some issues need attention.');
    } else {
      console.log('🚨 Critical issues found. Please review and fix.');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the tests
async function main() {
  const tester = new PaymentSystemTester();
  await tester.runAllTests();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Test suite crashed:', error);
  process.exit(1);
});