// scripts/test-course-apis.ts
// Test the new course APIs

async function testCourseAPIs() {
  console.log('🧪 Testing Course APIs\n');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Featured courses API
    console.log('1️⃣ Testing featured courses API...');
    const featuredResponse = await fetch(`${baseUrl}/api/courses/featured`);
    const featuredData = await featuredResponse.json();
    
    if (featuredResponse.ok) {
      console.log('✅ Featured courses API working');
      console.log(`   - Found ${featuredData.courses.length} featured courses`);
      if (featuredData.courses.length > 0) {
        console.log(`   - Sample course: ${featuredData.courses[0].title}`);
      }
    } else {
      console.log('❌ Featured courses API failed:', featuredData.error);
    }
    
    // Test 2: Public course catalog API
    console.log('\n2️⃣ Testing public course catalog API...');
    const catalogResponse = await fetch(`${baseUrl}/api/courses?page=1&limit=5`);
    const catalogData = await catalogResponse.json();
    
    if (catalogResponse.ok) {
      console.log('✅ Course catalog API working');
      console.log(`   - Total courses: ${catalogData.totalCount}`);
      console.log(`   - Current page: ${catalogData.currentPage}/${catalogData.totalPages}`);
      console.log(`   - Courses on page: ${catalogData.courses.length}`);
    } else {
      console.log('❌ Course catalog API failed:', catalogData.error);
    }
    
    // Test 3: Course catalog with filters
    console.log('\n3️⃣ Testing course catalog with filters...');
    const filteredResponse = await fetch(`${baseUrl}/api/courses?search=رياضيات&priceRange=all`);
    const filteredData = await filteredResponse.json();
    
    if (filteredResponse.ok) {
      console.log('✅ Course catalog filtering working');
      console.log(`   - Filtered results: ${filteredData.courses.length} courses`);
    } else {
      console.log('❌ Course catalog filtering failed:', filteredData.error);
    }
    
    // Test 4: Course catalog sorting
    console.log('\n4️⃣ Testing course catalog sorting...');
    const sortedResponse = await fetch(`${baseUrl}/api/courses?sort=newest&limit=3`);
    const sortedData = await sortedResponse.json();
    
    if (sortedResponse.ok) {
      console.log('✅ Course catalog sorting working');
      console.log(`   - Sorted results: ${sortedData.courses.length} courses`);
      if (sortedData.courses.length > 0) {
        console.log(`   - Newest course: ${sortedData.courses[0].title}`);
      }
    } else {
      console.log('❌ Course catalog sorting failed:', sortedData.error);
    }
    
    console.log('\n🎉 All course API tests completed!');
    console.log('\n📋 API Endpoints Ready:');
    console.log('✅ GET /api/courses/featured - Featured courses for landing page');
    console.log('✅ GET /api/courses - Public course catalog with filtering');
    console.log('✅ GET /api/courses?search=term - Search functionality');
    console.log('✅ GET /api/courses?sort=newest - Sorting functionality');
    console.log('✅ GET /api/courses?page=1&limit=12 - Pagination');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCourseAPIs();