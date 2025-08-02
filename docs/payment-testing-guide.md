# Payment System Testing Guide

This guide covers the comprehensive testing suite for the payment system, including all payment flows, admin interfaces, and webhook processing.

## Test Suite Overview

The payment system test suite (`scripts/test-complete-payment-system.ts`) covers:

### 🔄 Core Payment Flow
- Payment initiation
- Payment processing simulation
- Webhook processing and verification
- Enrollment creation after successful payment

### 👨‍💼 Admin Payment Management
- Payment list retrieval and display
- Payment filtering by status, date, and search terms
- Payment pagination and statistics
- Payment actions (complete, cancel, retry enrollment)
- Payment export functionality (CSV/JSON)

### 👨‍🎓 Student Payment Interface
- Student payment history
- Payment details modal
- Payment retry functionality

### 🔗 Webhook System
- Webhook signature verification
- Webhook payload validation
- Webhook idempotency handling
- Webhook error handling and retry mechanism
- Webhook processing attempts tracking

### 🛡️ Security & Error Handling
- Authentication and authorization checks
- Input validation and sanitization
- Error handling and recovery
- Data consistency verification

## Running the Tests

### Prerequisites

1. **Environment Setup**
   ```bash
   # Ensure all environment variables are set
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Database Setup**
   ```bash
   # Reset and prepare the database
   npm run db:reset
   npm run db:push
   ```

### Running Tests

#### Complete Test Suite
```bash
# Run the full payment system test suite
npm run test:payment-system
```

#### Direct Test Execution
```bash
# Run tests directly with tsx
npm run test:payment-complete
```

#### Individual Test Components
```bash
# Run specific payment-related tests
npm run test:payment-flow
npm run test:payment-enrollment
npm run test:paymob-integration
```

## Test Categories

### 1. Payment Flow Tests

**Test Coverage:**
- ✅ Payment initiation with course selection
- ✅ PayMob integration and payment processing
- ✅ Webhook reception and signature verification
- ✅ Payment status updates (PENDING → PROCESSING → COMPLETED)
- ✅ Enrollment creation after successful payment
- ✅ Course enrollment count updates

**Expected Results:**
- Payment records created with correct status progression
- Webhook events processed and stored
- Student enrollments created automatically
- Course statistics updated accurately

### 2. Admin Interface Tests

**Test Coverage:**
- ✅ Payment list with pagination
- ✅ Payment filtering (status, date range, search)
- ✅ Payment statistics dashboard
- ✅ Manual payment completion
- ✅ Payment cancellation
- ✅ Enrollment retry functionality
- ✅ Payment export (CSV/JSON formats)

**Expected Results:**
- Admin can view and manage all payments
- Filtering and search work correctly
- Statistics reflect accurate data
- Manual actions update payment status
- Export generates proper file formats

### 3. Student Interface Tests

**Test Coverage:**
- ✅ Student payment history display
- ✅ Payment details modal with full information
- ✅ Payment retry for failed payments
- ✅ Payment status tracking

**Expected Results:**
- Students see only their own payments
- Payment details are complete and accurate
- Failed payments can be retried
- Status updates reflect in real-time

### 4. Webhook Processing Tests

**Test Coverage:**
- ✅ Signature verification (HMAC-SHA512)
- ✅ Payload validation and structure checking
- ✅ Idempotency (duplicate webhook handling)
- ✅ Error handling and retry mechanism
- ✅ Processing attempts tracking
- ✅ Webhook event storage and retrieval

**Expected Results:**
- Invalid signatures are rejected
- Malformed payloads are handled gracefully
- Duplicate webhooks don't cause issues
- Failed webhooks can be retried
- All webhook events are logged

### 5. Security Tests

**Test Coverage:**
- ✅ Authentication checks for all endpoints
- ✅ Authorization (admin vs student vs professor)
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ CSRF protection verification

**Expected Results:**
- Unauthenticated requests are rejected
- Users can only access their own data
- Invalid input is properly handled
- Security vulnerabilities are prevented

## Test Data Management

### Setup Process
1. **Test Users Created:**
   - Admin user for management operations
   - Professor user for course ownership
   - Student user for payment testing

2. **Test Course Created:**
   - Published course with proper pricing
   - Associated with test professor
   - Configured for payment testing

3. **Test Categories:**
   - Test category for course organization

### Cleanup Process
- All test data is automatically cleaned up after tests
- Foreign key constraints are handled properly
- Database state is restored to pre-test condition

## Expected Test Results

### Success Criteria
- **90%+ Success Rate:** Indicates excellent system health
- **70-89% Success Rate:** Good, but some issues need attention
- **<70% Success Rate:** Critical issues requiring immediate attention

### Common Test Failures

#### Payment Flow Issues
- **PayMob Integration Errors:** Check API keys and configuration
- **Webhook Signature Failures:** Verify HMAC secret configuration
- **Database Connection Issues:** Ensure Prisma is properly configured

#### Admin Interface Issues
- **Authentication Failures:** Check session management
- **Permission Errors:** Verify role-based access control
- **Data Serialization Issues:** Check Decimal to number conversion

#### Student Interface Issues
- **Payment History Empty:** Verify user association
- **Retry Failures:** Check payment status validation
- **Modal Data Missing:** Verify API response structure

## Troubleshooting

### Environment Issues
```bash
# Check environment variables
echo $PAYMOB_API_KEY
echo $PAYMOB_HMAC_SECRET
echo $DATABASE_URL

# Verify database connection
npx prisma db push
```

### PayMob Configuration
```bash
# Test PayMob connectivity
curl -X POST https://accept.paymob.com/api/auth/tokens \
  -H "Content-Type: application/json" \
  -d '{"api_key": "YOUR_API_KEY"}'
```

### Database Issues
```bash
# Reset database if needed
npm run db:reset
npm run db:push

# Check database schema
npx prisma studio
```

### Webhook Testing
```bash
# Test webhook endpoint manually
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Content-Type: application/json" \
  -H "X-Paymob-Signature: test-signature" \
  -d '{"type": "TRANSACTION", "obj": {...}}'
```

## Continuous Integration

### GitHub Actions Integration
```yaml
# .github/workflows/payment-tests.yml
name: Payment System Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:payment-system
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm install --save-dev husky
npx husky add .husky/pre-commit "npm run test:payment-system"
```

## Performance Monitoring

### Test Execution Time
- **Target:** Complete suite should run in under 5 minutes
- **Monitoring:** Track test execution time trends
- **Optimization:** Parallel test execution where possible

### Database Performance
- **Connection Pooling:** Monitor connection usage
- **Query Optimization:** Track slow queries during tests
- **Index Usage:** Verify proper index utilization

## Reporting

### Test Results Format
```
🎯 PAYMENT SYSTEM TEST RESULTS
=============================================================
✅ Passed: 45
❌ Failed: 2
📊 Total: 47
🎯 Success Rate: 95.7%
=============================================================
```

### Failed Test Details
- Detailed error messages and stack traces
- Specific test case identification
- Suggested remediation steps
- Related system components affected

## Best Practices

### Test Maintenance
1. **Regular Updates:** Keep tests updated with system changes
2. **Data Isolation:** Ensure tests don't interfere with each other
3. **Error Handling:** Comprehensive error scenario coverage
4. **Documentation:** Keep test documentation current

### Development Workflow
1. **Run Tests Before Commits:** Ensure changes don't break functionality
2. **Test-Driven Development:** Write tests for new features
3. **Regression Testing:** Verify fixes don't introduce new issues
4. **Performance Testing:** Monitor system performance impact

This comprehensive testing suite ensures the payment system is robust, secure, and reliable for production use.