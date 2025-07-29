// scripts/test-payment-api.ts
// Test payment API directly

import fetch from 'node-fetch';

async function testPaymentAPI() {
  console.log('🔍 Testing Payment API...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    const healthResponse = await fetch(`${baseUrl}/api/courses?limit=1`);
    console.log('Server status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      console.log('❌ Server is not responding properly');
      return;
    }
    
    const coursesData = await healthResponse.json();
    console.log('✅ Server is running, found courses:', coursesData.courses?.length || 0);
    
    if (!coursesData.courses || coursesData.courses.length === 0) {
      console.log('❌ No courses available for testing');
      return;
    }
    
    const testCourse = coursesData.courses[0];
    console.log('Using test course:', testCourse.title, 'Price:', testCourse.price);
    
    // Test 2: Test payment initiation without authentication
    console.log('2. Testing payment initiation without auth...');
    const unauthResponse = await fetch(`${baseUrl}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        courseId: testCourse.id
      }),
    });
    
    console.log('Unauth response status:', unauthResponse.status);
    console.log('Unauth response headers:', Object.fromEntries(unauthResponse.headers.entries()));
    
    const contentType = unauthResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const unauthData = await unauthResponse.json();
      console.log('Unauth response data:', unauthData);
    } else {
      const htmlText = await unauthResponse.text();
      console.log('❌ Received HTML instead of JSON (first 200 chars):');
      console.log(htmlText.substring(0, 200));
    }
    
    // Test 3: Test debug endpoint
    console.log('3. Testing debug endpoint...');
    const debugResponse = await fetch(`${baseUrl}/api/debug-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'debug-payment',
        courseId: testCourse.id
      }),
    });
    
    console.log('Debug response status:', debugResponse.status);
    const debugContentType = debugResponse.headers.get('content-type');
    
    if (debugContentType && debugContentType.includes('application/json')) {
      const debugData = await debugResponse.json();
      console.log('Debug response data:', JSON.stringify(debugData, null, 2));
    } else {
      const debugHtml = await debugResponse.text();
      console.log('❌ Debug endpoint returned HTML (first 200 chars):');
      console.log(debugHtml.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
  }
}

testPaymentAPI();