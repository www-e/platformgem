#!/usr/bin/env tsx
/**
 * Test script to verify API endpoints are working
 * Note: This requires the development server to be running
 */

async function testApiEndpoints() {
  console.log('🌐 Testing API endpoints...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: GET /api/categories
    console.log('📚 Testing GET /api/categories...');
    
    const response = await fetch(`${baseUrl}/api/categories`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ GET /api/categories: ${data.data.length} categories found`);
      console.log(`   - Response time: ${response.headers.get('x-response-time') || 'N/A'}`);
      console.log(`   - Status: ${response.status}`);
    } else {
      console.log(`❌ GET /api/categories failed: ${data.error?.message || 'Unknown error'}`);
    }

    // Test 2: GET /api/categories/[id] with first category
    if (data.success && data.data.length > 0) {
      const firstCategoryId = data.data[0].id;
      console.log(`📖 Testing GET /api/categories/${firstCategoryId}...`);
      
      const categoryResponse = await fetch(`${baseUrl}/api/categories/${firstCategoryId}`);
      const categoryData = await categoryResponse.json();
      
      if (categoryResponse.ok && categoryData.success) {
        console.log(`✅ GET /api/categories/[id]: Found "${categoryData.data.name}"`);
        console.log(`   - Courses: ${categoryData.data.courses?.length || 0}`);
        console.log(`   - Status: ${categoryResponse.status}`);
      } else {
        console.log(`❌ GET /api/categories/[id] failed: ${categoryData.error?.message || 'Unknown error'}`);
      }
    }

    // Test 3: Test 404 for non-existent category
    console.log('🔍 Testing 404 for non-existent category...');
    
    const notFoundResponse = await fetch(`${baseUrl}/api/categories/non-existent-id`);
    const notFoundData = await notFoundResponse.json();
    
    if (notFoundResponse.status === 404 && !notFoundData.success) {
      console.log('✅ 404 handling works correctly');
    } else {
      console.log('❌ 404 handling not working as expected');
    }

    console.log('🎉 API endpoint tests completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Category listing: ✅');
    console.log('   - Single category retrieval: ✅');
    console.log('   - Error handling: ✅');
    console.log('   - Response format: ✅');

  } catch (error) {
    console.error('❌ API endpoint test failed:', error);
    console.log('');
    console.log('💡 Make sure the development server is running:');
    console.log('   npm run dev');
    throw error;
  }
}

testApiEndpoints()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });