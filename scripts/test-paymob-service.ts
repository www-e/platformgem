// scripts/test-paymob-service.ts
// Test PayMob service directly

async function testPayMobService() {
  console.log('🔍 Testing PayMob Service...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('PAYMOB_API_KEY:', process.env.PAYMOB_API_KEY ? 'Configured' : 'Missing');
  console.log('PAYMOB_INTEGRATION_ID_ONLINE_CARD:', process.env.PAYMOB_INTEGRATION_ID_ONLINE_CARD ? 'Configured' : 'Missing');
  console.log('PAYMOB_INTEGRATION_ID_MOBILE_WALLET:', process.env.PAYMOB_INTEGRATION_ID_MOBILE_WALLET ? 'Configured' : 'Missing');
  console.log('PAYMOB_BASE_URL:', process.env.PAYMOB_BASE_URL ? 'Configured' : 'Missing');
  console.log('PAYMOB_IFRAME_ID:', process.env.PAYMOB_IFRAME_ID ? 'Configured' : 'Missing');
  console.log('PAYMOB_HMAC_SECRET:', process.env.PAYMOB_HMAC_SECRET ? 'Configured' : 'Missing');
  
  try {
    // Import PayMob service
    const { payMobService } = await import('../src/lib/paymob');
    console.log('✅ PayMob service imported successfully');
    
    // Test authentication
    console.log('🔐 Testing authentication...');
    const authToken = await payMobService.authenticate();
    console.log('✅ Authentication successful, token length:', authToken.length);
    
    // Test order creation
    console.log('📦 Testing order creation...');
    const orderData = {
      amount_cents: 10000, // 100 EGP
      currency: 'EGP',
      merchant_order_id: 'test_order_' + Date.now(),
      items: [{
        name: 'Test Course',
        amount_cents: 10000,
        description: 'Test course description',
        quantity: 1
      }],
      billing_data: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone_number: '01234567890',
        country: 'EG',
        state: 'Cairo',
        city: 'Cairo',
        street: 'Test Street',
        building: '1',
        floor: '1',
        apartment: '1'
      }
    };
    
    const order = await payMobService.createOrder(authToken, orderData);
    console.log('✅ Order created successfully, ID:', order.id);
    
    // Test payment key generation
    console.log('🔑 Testing payment key generation...');
    const paymentKey = await payMobService.getPaymentKey(
      authToken,
      order.id,
      orderData.amount_cents,
      orderData.billing_data
    );
    console.log('✅ Payment key generated successfully, length:', paymentKey.length);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testPayMobService();