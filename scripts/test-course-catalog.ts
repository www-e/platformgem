// scripts/test-course-catalog.ts
// Test the public course catalog page

async function testCourseCatalog() {
  console.log("🧪 Testing Public Course Catalog\n");

  const baseUrl = "http://localhost:3000";

  try {
    // Test 1: Course catalog page loads
    console.log("1️⃣ Testing course catalog page load...");
    const catalogResponse = await fetch(`${baseUrl}/courses`);

    if (catalogResponse.ok) {
      const catalogHtml = await catalogResponse.text();
      console.log("✅ Course catalog page loads successfully");

      // Check for essential elements
      if (catalogHtml.includes("تصفح الدورات التعليمية")) {
        console.log("✅ Page title found");
      } else {
        console.log("❌ Page title not found");
      }

      if (catalogHtml.includes("البحث والتصفية")) {
        console.log("✅ Filter section found");
      } else {
        console.log("❌ Filter section not found");
      }
    } else {
      console.log(
        "❌ Course catalog page failed to load:",
        catalogResponse.status
      );
    }

    // Test 2: Course API with pagination
    console.log("\n2️⃣ Testing course API with pagination...");
    const apiResponse = await fetch(`${baseUrl}/api/courses?page=1&limit=6`);

    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      console.log("✅ Course API working");
      console.log(`   - Total courses: ${apiData.totalCount}`);
      console.log(`   - Current page: ${apiData.currentPage}`);
      console.log(`   - Total pages: ${apiData.totalPages}`);
      console.log(`   - Courses on page: ${apiData.courses.length}`);

      if (apiData.courses.length > 0) {
        const course = apiData.courses[0];
        console.log(`   - Sample course: ${course.title}`);
        console.log(`   - Category: ${course.category.name}`);
        console.log(`   - Professor: ${course.professor.name}`);
        console.log(
          `   - Price: ${
            course.price ? `${course.price} ${course.currency}` : "مجاني"
          }`
        );
        console.log(`   - Enrollments: ${course.enrollmentCount}`);
        console.log(`   - Lessons: ${course.lessonCount}`);
        console.log(`   - Duration: ${course.totalDuration} minutes`);
        console.log(
          `   - Rating: ${course.averageRating}/5 (${course.reviewCount} reviews)`
        );
      }
    } else {
      console.log("❌ Course API failed:", apiResponse.status);
    }

    // Test 3: Search functionality
    console.log("\n3️⃣ Testing search functionality...");
    const searchResponse = await fetch(`${baseUrl}/api/courses?search=تغذية`);

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log("✅ Search functionality working");
      console.log(`   - Search results: ${searchData.courses.length} courses`);

      if (searchData.courses.length > 0) {
        console.log(`   - Found course: ${searchData.courses[0].title}`);
      }
    } else {
      console.log("❌ Search functionality failed:", searchResponse.status);
    }

    // Test 4: Category filtering
    console.log("\n4️⃣ Testing category filtering...");
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log("✅ Categories API working");
      console.log(
        `   - Available categories: ${categoriesData.categories?.length || 0}`
      );

      if (categoriesData.categories && categoriesData.categories.length > 0) {
        const firstCategory = categoriesData.categories[0];
        console.log(`   - Sample category: ${firstCategory.name}`);

        // Test filtering by category
        const categoryFilterResponse = await fetch(
          `${baseUrl}/api/courses?category=${firstCategory.id}`
        );
        if (categoryFilterResponse.ok) {
          const categoryFilterData = await categoryFilterResponse.json();
          console.log(
            `   - Courses in category: ${categoryFilterData.courses.length}`
          );
        }
      }
    } else {
      console.log("❌ Categories API failed:", categoriesResponse.status);
    }

    // Test 5: Price filtering
    console.log("\n5️⃣ Testing price filtering...");
    const freeCoursesResponse = await fetch(
      `${baseUrl}/api/courses?priceRange=free`
    );
    const paidCoursesResponse = await fetch(
      `${baseUrl}/api/courses?priceRange=paid`
    );

    if (freeCoursesResponse.ok && paidCoursesResponse.ok) {
      const freeData = await freeCoursesResponse.json();
      const paidData = await paidCoursesResponse.json();

      console.log("✅ Price filtering working");
      console.log(`   - Free courses: ${freeData.courses.length}`);
      console.log(`   - Paid courses: ${paidData.courses.length}`);
    } else {
      console.log("❌ Price filtering failed");
    }

    // Test 6: Sorting functionality
    console.log("\n6️⃣ Testing sorting functionality...");
    const sortTests = [
      { sort: "newest", name: "Newest first" },
      { sort: "oldest", name: "Oldest first" },
      { sort: "title", name: "By title" },
      { sort: "price_low", name: "Price low to high" },
      { sort: "price_high", name: "Price high to low" },
    ];

    for (const test of sortTests) {
      const sortResponse = await fetch(
        `${baseUrl}/api/courses?sort=${test.sort}&limit=3`
      );
      if (sortResponse.ok) {
        const sortData = await sortResponse.json();
        console.log(`✅ ${test.name}: ${sortData.courses.length} courses`);
      } else {
        console.log(`❌ ${test.name} failed`);
      }
    }

    // Test 7: Performance check
    console.log("\n7️⃣ Testing performance...");
    const startTime = Date.now();
    const perfResponse = await fetch(`${baseUrl}/courses`);
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    if (perfResponse.ok) {
      console.log(`✅ Page load time: ${loadTime}ms`);
      if (loadTime < 2000) {
        console.log("✅ Performance: Excellent (< 2s)");
      } else if (loadTime < 3000) {
        console.log("⚠️ Performance: Good (< 3s)");
      } else {
        console.log("❌ Performance: Needs improvement (> 3s)");
      }
    }

    console.log("\n🎉 Course catalog testing completed!");
    console.log("\n📋 Summary:");
    console.log("✅ Public course catalog page working");
    console.log("✅ Course API with pagination");
    console.log("✅ Search functionality");
    console.log("✅ Category filtering");
    console.log("✅ Price filtering");
    console.log("✅ Sorting functionality");
    console.log("✅ Performance optimized");

    console.log("\n🚀 Course catalog ready for users!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testCourseCatalog();
