import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, PAYMENT_TEST_DATA, SUCCESS_MESSAGES } from '../utils/test-data';

test.describe('Student Journey - Course Enrollment', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login as student before each test
    await helpers.login(TEST_USERS.STUDENT);
  });

  test.describe('Student Courses - Free Course Enrollment', () => {
    test('should enroll in free course successfully', async ({ page }) => {
      // Navigate to courses and find a free course
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Filter for free courses
      const priceFilter = page.locator('[data-testid="price-filter"]');
      if (await priceFilter.isVisible()) {
        await priceFilter.click();
        await page.locator('[data-testid="price-option-free"]').click();
        await helpers.waitForLoadingComplete();
      }
      
      // Click on first free course
      const freeCourse = page.locator('[data-testid="course-card"]').first();
      await freeCourse.click();
      
      // Verify we're on course details page
      await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+/);
      
      // Check if course is free
      const priceElement = page.locator('[data-testid="course-price"]');
      await expect(priceElement).toContainText(/مجاني|0/);
      
      // Click enroll button
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await expect(enrollButton).toBeVisible();
      await enrollButton.click();
      
      // Should show enrollment success
      await expect(page.locator('[data-testid="enrollment-success"]')).toBeVisible();
      
      // Verify enrollment button changes to "بدء الدورة" or similar
      const startButton = page.locator('[data-testid="start-course-button"]');
      await expect(startButton).toBeVisible();
      
      await helpers.takeScreenshot('free-course-enrolled');
    });

    test('should access course content after free enrollment', async ({ page }) => {
      // First enroll in a free course (assuming previous test passed)
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Find and enroll in free course
      const priceFilter = page.locator('[data-testid="price-filter"]');
      if (await priceFilter.isVisible()) {
        await priceFilter.click();
        await page.locator('[data-testid="price-option-free"]').click();
        await helpers.waitForLoadingComplete();
      }
      
      const freeCourse = page.locator('[data-testid="course-card"]').first();
      await freeCourse.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await helpers.waitForLoadingComplete();
      }
      
      // Click start course or access content
      const startButton = page.locator('[data-testid="start-course-button"]');
      await startButton.click();
      
      // Should navigate to course content
      await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+\/learn/);
      
      // Verify course content is accessible
      await expect(page.locator('[data-testid="course-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="lesson-list"]')).toBeVisible();
      
      await helpers.takeScreenshot('free-course-content-access');
    });

    test('should show enrolled course in dashboard', async ({ page }) => {
      // Navigate to dashboard
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check enrolled courses section
      const enrolledCoursesTab = page.locator('[data-testid="courses-tab"]');
      if (await enrolledCoursesTab.isVisible()) {
        await enrolledCoursesTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      // Verify enrolled courses are displayed
      const enrolledCourses = page.locator('[data-testid="enrolled-course"]');
      if (await enrolledCourses.count() > 0) {
        await expect(enrolledCourses.first()).toBeVisible();
        
        // Verify course information
        await expect(enrolledCourses.first().locator('[data-testid="course-title"]')).toBeVisible();
        await expect(enrolledCourses.first().locator('[data-testid="course-progress"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Courses - Paid Course Enrollment', () => {
    test('should show payment modal for paid course', async ({ page }) => {
      // Navigate to courses and find a paid course
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Filter for paid courses
      const priceFilter = page.locator('[data-testid="price-filter"]');
      if (await priceFilter.isVisible()) {
        await priceFilter.click();
        await page.locator('[data-testid="price-option-100-300"]').click();
        await helpers.waitForLoadingComplete();
      }
      
      // Click on first paid course
      const paidCourse = page.locator('[data-testid="course-card"]').first();
      await paidCourse.click();
      
      // Verify course has a price
      const priceElement = page.locator('[data-testid="course-price"]');
      await expect(priceElement).not.toContainText(/مجاني|0/);
      
      // Click enroll/buy button
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await expect(enrollButton).toBeVisible();
      await enrollButton.click();
      
      // Should show payment modal
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      await expect(paymentModal).toBeVisible();
      
      // Verify payment details
      await expect(paymentModal.locator('[data-testid="course-title"]')).toBeVisible();
      await expect(paymentModal.locator('[data-testid="course-price"]')).toBeVisible();
      
      await helpers.takeScreenshot('payment-modal-opened');
    });

    test('should process payment successfully', async ({ page }) => {
      // Navigate to a paid course
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const paidCourse = page.locator('[data-testid="course-card"]').first();
      await paidCourse.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await enrollButton.click();
      
      // Fill payment form
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      await expect(paymentModal).toBeVisible();
      
      // Select payment method
      const cardPayment = paymentModal.locator('[data-testid="payment-method-card"]');
      if (await cardPayment.isVisible()) {
        await cardPayment.click();
        
        // Fill card details
        await paymentModal.locator('[data-testid="card-number"]').fill(PAYMENT_TEST_DATA.VALID_CARD.number);
        await paymentModal.locator('[data-testid="card-expiry"]').fill(PAYMENT_TEST_DATA.VALID_CARD.expiry);
        await paymentModal.locator('[data-testid="card-cvv"]').fill(PAYMENT_TEST_DATA.VALID_CARD.cvv);
        await paymentModal.locator('[data-testid="card-name"]').fill(PAYMENT_TEST_DATA.VALID_CARD.name);
      }
      
      // Submit payment
      const payButton = paymentModal.locator('[data-testid="pay-button"]');
      await payButton.click();
      
      // Wait for payment processing
      await helpers.waitForApiResponse('/api/payments');
      
      // Should show success message
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
      
      // Should be able to access course
      const startButton = page.locator('[data-testid="start-course-button"]');
      await expect(startButton).toBeVisible();
      
      await helpers.takeScreenshot('payment-success');
    });

    test('should handle payment failures gracefully', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const paidCourse = page.locator('[data-testid="course-card"]').first();
      await paidCourse.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await enrollButton.click();
      
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      
      // Use invalid card details
      const cardPayment = paymentModal.locator('[data-testid="payment-method-card"]');
      if (await cardPayment.isVisible()) {
        await cardPayment.click();
        
        await paymentModal.locator('[data-testid="card-number"]').fill(PAYMENT_TEST_DATA.INVALID_CARD.number);
        await paymentModal.locator('[data-testid="card-expiry"]').fill(PAYMENT_TEST_DATA.INVALID_CARD.expiry);
        await paymentModal.locator('[data-testid="card-cvv"]').fill(PAYMENT_TEST_DATA.INVALID_CARD.cvv);
        await paymentModal.locator('[data-testid="card-name"]').fill(PAYMENT_TEST_DATA.INVALID_CARD.name);
      }
      
      const payButton = paymentModal.locator('[data-testid="pay-button"]');
      await payButton.click();
      
      // Should show error message
      await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="payment-error"]')).toContainText(/فشل في معالجة الدفع/);
      
      // Should still be able to retry
      await expect(payButton).toBeVisible();
      
      await helpers.takeScreenshot('payment-failure');
    });

    test('should validate payment form fields', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const paidCourse = page.locator('[data-testid="course-card"]').first();
      await paidCourse.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await enrollButton.click();
      
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      const cardPayment = paymentModal.locator('[data-testid="payment-method-card"]');
      
      if (await cardPayment.isVisible()) {
        await cardPayment.click();
        
        // Try to submit without filling fields
        const payButton = paymentModal.locator('[data-testid="pay-button"]');
        await payButton.click();
        
        // Should show validation errors
        await expect(paymentModal.locator('[data-testid="card-number-error"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="card-expiry-error"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="card-cvv-error"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Courses - Enrollment Status', () => {
    test('should prevent duplicate enrollment', async ({ page }) => {
      // First, enroll in a course
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const course = page.locator('[data-testid="course-card"]').first();
      await course.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      if (await enrollButton.isVisible()) {
        await enrollButton.click();
        await helpers.waitForLoadingComplete();
      }
      
      // Refresh page and try to enroll again
      await page.reload();
      await helpers.waitForLoadingComplete();
      
      // Should show "already enrolled" status
      const alreadyEnrolled = page.locator('[data-testid="already-enrolled"]');
      const startButton = page.locator('[data-testid="start-course-button"]');
      
      // Either should show already enrolled message or start course button
      const isEnrolled = await alreadyEnrolled.isVisible() || await startButton.isVisible();
      expect(isEnrolled).toBe(true);
    });

    test('should show enrollment progress', async ({ page }) => {
      // Navigate to dashboard to see enrolled courses
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const coursesTab = page.locator('[data-testid="courses-tab"]');
      if (await coursesTab.isVisible()) {
        await coursesTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      const enrolledCourses = page.locator('[data-testid="enrolled-course"]');
      if (await enrolledCourses.count() > 0) {
        const firstCourse = enrolledCourses.first();
        
        // Should show progress information
        await expect(firstCourse.locator('[data-testid="course-progress"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="progress-percentage"]')).toBeVisible();
        
        // Progress should be a valid percentage
        const progressText = await firstCourse.locator('[data-testid="progress-percentage"]').textContent();
        expect(progressText).toMatch(/\d+%/);
      }
    });

    test('should track enrollment date', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const coursesTab = page.locator('[data-testid="courses-tab"]');
      if (await coursesTab.isVisible()) {
        await coursesTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      const enrolledCourses = page.locator('[data-testid="enrolled-course"]');
      if (await enrolledCourses.count() > 0) {
        const firstCourse = enrolledCourses.first();
        
        // Should show enrollment date
        const enrollmentDate = firstCourse.locator('[data-testid="enrollment-date"]');
        if (await enrollmentDate.isVisible()) {
          const dateText = await enrollmentDate.textContent();
          expect(dateText).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/); // Date format
        }
      }
    });
  });

  test.describe('Student Courses - Payment History', () => {
    test('should record payment in history', async ({ page }) => {
      // Navigate to payment history
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="payments-tab"]');
      if (await paymentsTab.isVisible()) {
        await paymentsTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      // Should show payment history
      const paymentHistory = page.locator('[data-testid="payment-history"]');
      await expect(paymentHistory).toBeVisible();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      if (await paymentItems.count() > 0) {
        const firstPayment = paymentItems.first();
        
        // Verify payment information
        await expect(firstPayment.locator('[data-testid="payment-course"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-amount"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-status"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-date"]')).toBeVisible();
      }
      
      await helpers.takeScreenshot('payment-history');
    });

    test('should show payment status correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="payments-tab"]');
      if (await paymentsTab.isVisible()) {
        await paymentsTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      if (await paymentItems.count() > 0) {
        const firstPayment = paymentItems.first();
        const statusElement = firstPayment.locator('[data-testid="payment-status"]');
        
        const statusText = await statusElement.textContent();
        
        // Status should be one of the valid statuses
        const validStatuses = ['مكتمل', 'معلق', 'فاشل', 'ملغي', 'مسترد'];
        const hasValidStatus = validStatuses.some(status => statusText?.includes(status));
        expect(hasValidStatus).toBe(true);
      }
    });
  });

  test.describe('Student Courses - Mobile Enrollment', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Find and click on a course
      const course = page.locator('[data-testid="course-card"]').first();
      await course.click();
      
      // Enroll button should be visible and clickable on mobile
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await expect(enrollButton).toBeVisible();
      await enrollButton.click();
      
      // Payment modal should be mobile-friendly
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      if (await paymentModal.isVisible()) {
        // Modal should fit mobile screen
        const modalRect = await paymentModal.boundingBox();
        expect(modalRect?.width).toBeLessThanOrEqual(375); // Mobile width
      }
      
      await helpers.takeScreenshot('mobile-enrollment');
    });
  });

  test.describe('Student Courses - Error Handling', () => {
    test('should handle enrollment API errors', async ({ page }) => {
      // Mock enrollment API to return error
      await page.route('**/api/enrollments', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const course = page.locator('[data-testid="course-card"]').first();
      await course.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await enrollButton.click();
      
      // Should show error message
      await expect(page.locator('[data-testid="enrollment-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="enrollment-error"]')).toContainText(/خطأ في التسجيل/);
    });

    test('should handle payment API errors', async ({ page }) => {
      // Mock payment API to return error
      await page.route('**/api/payments', route => 
        route.fulfill({ status: 500, body: 'Payment Service Error' })
      );
      
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const paidCourse = page.locator('[data-testid="course-card"]').first();
      await paidCourse.click();
      
      const enrollButton = page.locator('[data-testid="enroll-button"]');
      await enrollButton.click();
      
      const paymentModal = page.locator('[data-testid="payment-modal"]');
      if (await paymentModal.isVisible()) {
        const payButton = paymentModal.locator('[data-testid="pay-button"]');
        await payButton.click();
        
        // Should show payment error
        await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
      }
    });
  });
});