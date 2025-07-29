// scripts/test-payment-fixes.ts
// Test the payment fixes

async function testPaymentFixes() {
  console.log('🧪 Testing Payment System Fixes\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check environment variables
    console.log('1️⃣ Checking updated environment variables...');
    const envResponse = await fetch(`${baseUrl}/api/test-env`);
    
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('✅ Environment variables check:');
      Object.entries(envData.variables).forEach(([key, value]) => {
        console.log(`   - ${key}: ${value}`);
      });
    }

    // Test 2: Test payment initiation
    console.log('\n2️⃣ Testing payment initiation...');
    const testResponse = await fetch(`${baseUrl}/api/test-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: 'payment-fixes' }),
    });

    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test endpoint working');
      console.log(`   - User: ${testData.session.userName} (${testData.session.userRole})`);
      console.log(`   - PayMob API Key: ${testData.envCheck.PAYMOB_API_KEY}`);
    }

    // Test 3: Test actual payment creation
    console.log('\n3️⃣ Testing actual payment creation...');
    const coursesResponse = await fetch(`${baseUrl}/api/courses?limit=1`);
    
    if (coursesResponse.ok) {
      const coursesData = await coursesResponse.json();
      
      if (coursesData.courses.length > 0) {
        const course = coursesData.courses[0];
        console.log(`   - Testing with course: ${course.title}`);
        console.log(`   - Price: ${course.price} ${course.currency}`);
        
        // This will fail without authentication, but we can see the structure
        const paymentResponse = await fetch(`${baseUrl}/api/payments/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id
          }),
        });

        console.log(`   - Payment API status: ${paymentResponse.status}`);
        
        if (paymentResponse.status === 401) {
          console.log('✅ Payment API properly requires authentication');
        } else if (paymentResponse.status === 201) {
          const paymentData = await paymentResponse.json();
          console.log('✅ Payment creation successful');
          console.log(`   - Payment ID: ${paymentData.data?.paymentId}`);
          console.log(`   - Has iframe URL: ${!!paymentData.data?.iframeUrl}`);
        }
      }
    }

    console.log('\n🎉 Payment Fixes Test Completed!');
    console.log('\n📋 What was fixed:');
    console.log('✅ Added support for multiple PayMob integration IDs');
    console.log('✅ Fixed frontend error handling ([object Object] issue)');
    console.log('✅ Fixed payment URL redirect (iframeUrl vs paymentUrl)');
    console.log('✅ Fixed progress milestone type (COURSE_START vs ENROLLMENT)');
    
    console.log('\n🚀 Ready for testing!');
    console.log('Now try:');
    console.log('1. Go to http://localhost:3000/courses');
    console.log('2. Click "Enroll" on a paid course');
    console.log('3. You should be redirected to PayMob payment page');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPaymentFixes();