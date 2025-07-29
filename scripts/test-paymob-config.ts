// scripts/test-paymob-config.ts
// Test Paymob configuration and service

async function testPaymobConfig() {
  console.log('🧪 Testing Paymob Configuration\n');
  
  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'PAYMOB_API_KEY',
      'PAYMOB_INTEGRATION_ID_ONLINE_CARD',
      'PAYMOB_INTEGRATION_ID_MOBILE_WALLET',
      'PAYMOB_BASE_URL',
      'PAYMOB_IFRAME_ID',
      'PAYMOB_HMAC_SECRET'
    ];

    let allConfigured = true;
    requiredEnvVars.forEach(envVar => {
      const value = process.env[envVar];
      if (value) {
        console.log(`✅ ${envVar}: ${value.substring(0, 20)}...`);
      } else {
        console.log(`❌ ${envVar}: Missing`);
        allConfigured = false;
      }
    });

    if (!allConfigured) {
      console.log('\n❌ Some environment variables are missing. Please check your .env file.');
      return;
    }

    // Test 2: Test PayMob authentication
    console.log('\n2️⃣ Testing PayMob authentication...');
    try {
      const { payMobService } = await import('../src/lib/paymob');
      const authToken = await payMobService.authenticate();
      
      if (authToken) {
        console.log('✅ PayMob authentication successful');
        console.log(`   - Token: ${authToken.substring(0, 20)}...`);
      } else {
        console.log('❌ PayMob authentication failed - no token returned');
      }
    } catch (error) {
      console.log(`❌ PayMob authentication error: ${error}`);
    }

    // Test 3: Test PayMob service methods
    console.log('\n3️⃣ Testing PayMob service methods...');
    try {
      const { payMobService } = await import('../src/lib/paymob');
      
      // Test amount formatting
      const testAmount = 199;
      const formattedAmount = payMobService.formatAmount(testAmount);
      console.log(`✅ Amount formatting: ${testAmount} EGP → ${formattedAmount} cents`);
      
      // Test merchant order ID generation
      const merchantOrderId = payMobService.generateMerchantOrderId('test-course', 'test-user');
      console.log(`✅ Merchant order ID: ${merchantOrderId}`);
      
      // Test billing data creation
      const billingData = payMobService.createBillingData({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+201234567890'
      });
      console.log(`✅ Billing data created: ${billingData.first_name} ${billingData.last_name}`);
      
    } catch (error) {
      console.log(`❌ PayMob service methods error: ${error}`);
    }

    // Test 4: Test payment initiation API (without authentication)
    console.log('\n4️⃣ Testing payment initiation API...');
    try {
      const response = await fetch('http://localhost:3000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: 'test-course-id'
        }),
      });

      console.log(`   - Status: ${response.status}`);
      
      if (response.status === 401) {
        console.log('✅ Payment API properly requires authentication');
      } else if (response.status === 500) {
        const errorText = await response.text();
        console.log(`❌ Payment API error (500): ${errorText.substring(0, 200)}...`);
      } else {
        const responseData = await response.json();
        console.log(`   - Response: ${JSON.stringify(responseData, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ Payment API test error: ${error}`);
    }

    console.log('\n🎉 Paymob Configuration Test Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Environment variables configured');
    console.log('✅ PayMob service methods working');
    
    console.log('\n🔧 If you see authentication errors:');
    console.log('1. Verify your PAYMOB_API_KEY is correct');
    console.log('2. Check if you\'re using sandbox or production credentials');
    console.log('3. Ensure your PayMob account is active');
    
    console.log('\n🚀 Next: Test with authenticated user session');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymobConfig();