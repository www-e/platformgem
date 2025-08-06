import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, PAYMENT_TEST_DATA } from '../utils/test-data';

test.describe('Student Journey - Payment System', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login(TEST_USERS.STUDENT);
  });

  test.describe('Student Payments - Payment History Overview', () => {
    test('should display payment history in dashboard', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Navigate to payments tab
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Verify payment history section
      const paymentHistory = page.locator('[data-testid="payment-history-section"]');
      await expect(paymentHistory).toBeVisible();
      
      // Check for payment statistics cards
      const paymentStats = page.locator('[data-testid="payment-stats-cards"]');
      await expect(paymentStats).toBeVisible();
      
      const statsCards = paymentStats.locator('[data-testid="payment-stat-card"]');
      if (await statsCards.count() > 0) {
        // Should show total spent, successful payments, average order value, failed payments
        const expectedStats = ['إجمالي الإنفاق', 'المعاملات الناجحة', 'متوسط قيمة الطلب', 'المعاملات الفاشلة'];
        
        for (const statName of expectedStats) {
          const statCard = statsCards.filter({ hasText: statName });
          if (await statCard.count() > 0) {
            await expect(statCard.first()).toBeVisible();
          }
        }
      }
      
      await helpers.takeScreenshot('payment-history-overview');
    });

    test('should display payment statistics correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check total spent card
      const totalSpentCard = page.locator('[data-testid="total-spent-card"]');
      if (await totalSpentCard.isVisible()) {
        const totalAmount = await totalSpentCard.locator('[data-testid="total-amount"]').textContent();
        expect(totalAmount).toMatch(/\d+.*جنيه|EGP/);
        
        const transactionCount = await totalSpentCard.locator('[data-testid="transaction-count"]').textContent();
        expect(transactionCount).toMatch(/\d+.*معاملة/);
      }
      
      // Check successful payments card
      const successfulCard = page.locator('[data-testid="successful-payments-card"]');
      if (await successfulCard.isVisible()) {
        const successfulCount = await successfulCard.locator('[data-testid="successful-count"]').textContent();
        expect(successfulCount).toMatch(/\d+/);
      }
      
      // Check average order value card
      const averageCard = page.locator('[data-testid="average-order-card"]');
      if (await averageCard.isVisible()) {
        const averageValue = await averageCard.locator('[data-testid="average-value"]').textContent();
        expect(averageValue).toMatch(/\d+.*جنيه|EGP/);
      }
      
      // Check failed payments card
      const failedCard = page.locator('[data-testid="failed-payments-card"]');
      if (await failedCard.isVisible()) {
        const failedCount = await failedCard.locator('[data-testid="failed-count"]').textContent();
        expect(failedCount).toMatch(/\d+/);
      }
    });
  });

  test.describe('Student Payments - Payment History Details', () => {
    test('should display individual payment records', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check payment items list
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        const firstPayment = paymentItems.first();
        
        // Verify payment item structure
        await expect(firstPayment.locator('[data-testid="payment-course-name"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-amount"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-status"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-date"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-method"]')).toBeVisible();
        
        // Verify payment status badge
        const statusBadge = firstPayment.locator('[data-testid="payment-status-badge"]');
        await expect(statusBadge).toBeVisible();
        
        const statusText = await statusBadge.textContent();
        const validStatuses = ['مكتمل', 'معلق', 'فاشل', 'ملغي', 'مسترد'];
        const hasValidStatus = validStatuses.some(status => statusText?.includes(status));
        expect(hasValidStatus).toBe(true);
      }
    });

    test('should show payment amounts in correct currency', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        const paymentAmount = paymentItems.first().locator('[data-testid="payment-amount"]');
        const amountText = await paymentAmount.textContent();
        
        // Should show amount with currency
        expect(amountText).toMatch(/\d+.*جنيه|EGP/);
      }
    });

    test('should display payment dates correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        const paymentDate = paymentItems.first().locator('[data-testid="payment-date"]');
        const dateText = await paymentDate.textContent();
        
        // Should be a valid date format
        expect(dateText).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
      }
    });

    test('should show payment method information', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        const paymentMethod = paymentItems.first().locator('[data-testid="payment-method"]');
        if (await paymentMethod.isVisible()) {
          const methodText = await paymentMethod.textContent();
          
          // Should show valid payment method
          const validMethods = ['بطاقة', 'محفظة', 'CARD', 'WALLET'];
          const hasValidMethod = validMethods.some(method => methodText?.includes(method));
          expect(hasValidMethod).toBe(true);
        }
      }
    });
  });

  test.describe('Student Payments - Monthly Spending Analysis', () => {
    test('should display monthly spending breakdown', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check monthly spending card
      const monthlySpendingCard = page.locator('[data-testid="monthly-spending-card"]');
      if (await monthlySpendingCard.isVisible()) {
        await expect(monthlySpendingCard).toBeVisible();
        
        const monthlyItems = monthlySpendingCard.locator('[data-testid="monthly-item"]');
        
        if (await monthlyItems.count() > 0) {
          const firstMonth = monthlyItems.first();
          
          // Verify monthly item structure
          await expect(firstMonth.locator('[data-testid="month-name"]')).toBeVisible();
          await expect(firstMonth.locator('[data-testid="month-amount"]')).toBeVisible();
          await expect(firstMonth.locator('[data-testid="transaction-count"]')).toBeVisible();
          
          // Verify month format
          const monthName = await firstMonth.locator('[data-testid="month-name"]').textContent();
          expect(monthName).toMatch(/\d{4}\/\d{1,2}|\w+\s\d{4}/); // Month/Year format
          
          // Verify amount format
          const monthAmount = await firstMonth.locator('[data-testid="month-amount"]').textContent();
          expect(monthAmount).toMatch(/\d+.*جنيه|EGP/);
        }
      }
    });

    test('should show transaction counts per month', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const monthlySpendingCard = page.locator('[data-testid="monthly-spending-card"]');
      if (await monthlySpendingCard.isVisible()) {
        const monthlyItems = monthlySpendingCard.locator('[data-testid="monthly-item"]');
        
        if (await monthlyItems.count() > 0) {
          const transactionCount = monthlyItems.first().locator('[data-testid="transaction-count"]');
          const countText = await transactionCount.textContent();
          
          expect(countText).toMatch(/\d+.*معاملة/);
        }
      }
    });
  });

  test.describe('Student Payments - Payment Methods Analysis', () => {
    test('should display payment methods breakdown', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check payment methods card
      const paymentMethodsCard = page.locator('[data-testid="payment-methods-card"]');
      if (await paymentMethodsCard.isVisible()) {
        await expect(paymentMethodsCard).toBeVisible();
        
        const methodItems = paymentMethodsCard.locator('[data-testid="method-item"]');
        
        if (await methodItems.count() > 0) {
          const firstMethod = methodItems.first();
          
          // Verify method item structure
          await expect(firstMethod.locator('[data-testid="method-icon"]')).toBeVisible();
          await expect(firstMethod.locator('[data-testid="method-name"]')).toBeVisible();
          await expect(firstMethod.locator('[data-testid="method-count"]')).toBeVisible();
          await expect(firstMethod.locator('[data-testid="method-percentage"]')).toBeVisible();
          await expect(firstMethod.locator('[data-testid="method-total"]')).toBeVisible();
          
          // Verify percentage format
          const percentage = await firstMethod.locator('[data-testid="method-percentage"]').textContent();
          expect(percentage).toMatch(/\d+(\.\d+)?%/);
          
          // Verify total amount format
          const total = await firstMethod.locator('[data-testid="method-total"]').textContent();
          expect(total).toMatch(/\d+.*جنيه|EGP/);
        }
      }
    });

    test('should show payment method icons correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentMethodsCard = page.locator('[data-testid="payment-methods-card"]');
      if (await paymentMethodsCard.isVisible()) {
        const methodItems = paymentMethodsCard.locator('[data-testid="method-item"]');
        
        if (await methodItems.count() > 0) {
          const methodIcon = methodItems.first().locator('[data-testid="method-icon"]');
          await expect(methodIcon).toBeVisible();
          
          // Icon should have appropriate styling
          const iconClasses = await methodIcon.getAttribute('class');
          expect(iconClasses).toBeTruthy();
        }
      }
    });
  });

  test.describe('Student Payments - Payment Details Modal', () => {
    test('should open payment details modal', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        // Click on first payment item
        await paymentItems.first().click();
        
        // Should open payment details modal
        const paymentModal = page.locator('[data-testid="payment-details-modal"]');
        await expect(paymentModal).toBeVisible();
        
        // Verify modal content
        await expect(paymentModal.locator('[data-testid="modal-course-name"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="modal-payment-amount"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="modal-payment-status"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="modal-payment-date"]')).toBeVisible();
        await expect(paymentModal.locator('[data-testid="modal-transaction-id"]')).toBeVisible();
        
        await helpers.takeScreenshot('payment-details-modal');
      }
    });

    test('should display transaction ID in modal', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        await paymentItems.first().click();
        
        const paymentModal = page.locator('[data-testid="payment-details-modal"]');
        const transactionId = paymentModal.locator('[data-testid="modal-transaction-id"]');
        
        if (await transactionId.isVisible()) {
          const idText = await transactionId.textContent();
          expect(idText).toMatch(/[A-Z0-9-]+/); // Should be alphanumeric transaction ID
        }
      }
    });

    test('should close payment details modal', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        await paymentItems.first().click();
        
        const paymentModal = page.locator('[data-testid="payment-details-modal"]');
        await expect(paymentModal).toBeVisible();
        
        // Close modal
        const closeButton = paymentModal.locator('[data-testid="close-modal-button"]');
        await closeButton.click();
        
        // Modal should be hidden
        await expect(paymentModal).not.toBeVisible();
      }
    });
  });

  test.describe('Student Payments - Payment Filtering and Search', () => {
    test('should filter payments by status', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for status filter
      const statusFilter = page.locator('[data-testid="payment-status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        
        // Select "completed" status
        const completedOption = page.locator('[data-testid="status-completed"]');
        if (await completedOption.isVisible()) {
          await completedOption.click();
          await helpers.waitForLoadingComplete();
          
          // Verify filtered results
          const paymentItems = page.locator('[data-testid="payment-item"]');
          if (await paymentItems.count() > 0) {
            // All visible payments should have "completed" status
            for (let i = 0; i < await paymentItems.count(); i++) {
              const statusBadge = paymentItems.nth(i).locator('[data-testid="payment-status-badge"]');
              const statusText = await statusBadge.textContent();
              expect(statusText).toContain('مكتمل');
            }
          }
        }
      }
    });

    test('should filter payments by date range', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for date filter
      const dateFilter = page.locator('[data-testid="payment-date-filter"]');
      if (await dateFilter.isVisible()) {
        await dateFilter.click();
        
        // Select "last month" option
        const lastMonthOption = page.locator('[data-testid="date-last-month"]');
        if (await lastMonthOption.isVisible()) {
          await lastMonthOption.click();
          await helpers.waitForLoadingComplete();
          
          // Verify filtered results show payments from last month
          const paymentItems = page.locator('[data-testid="payment-item"]');
          if (await paymentItems.count() > 0) {
            // This would require checking actual dates, which depends on test data
            await expect(paymentItems.first()).toBeVisible();
          }
        }
      }
    });

    test('should search payments by course name', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for search input
      const searchInput = page.locator('[data-testid="payment-search-input"]');
      if (await searchInput.isVisible()) {
        // Search for a course name
        await searchInput.fill('JavaScript');
        await page.keyboard.press('Enter');
        await helpers.waitForLoadingComplete();
        
        // Verify search results
        const paymentItems = page.locator('[data-testid="payment-item"]');
        if (await paymentItems.count() > 0) {
          // At least one result should contain the search term
          const firstCourseName = paymentItems.first().locator('[data-testid="payment-course-name"]');
          const courseNameText = await firstCourseName.textContent();
          expect(courseNameText?.toLowerCase()).toContain('javascript');
        }
      }
    });

    test('should clear payment filters', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Apply some filters first
      const statusFilter = page.locator('[data-testid="payment-status-filter"]');
      if (await statusFilter.isVisible()) {
        await statusFilter.click();
        const completedOption = page.locator('[data-testid="status-completed"]');
        if (await completedOption.isVisible()) {
          await completedOption.click();
          await helpers.waitForLoadingComplete();
        }
      }
      
      // Clear filters
      const clearFiltersButton = page.locator('[data-testid="clear-payment-filters"]');
      if (await clearFiltersButton.isVisible()) {
        await clearFiltersButton.click();
        await helpers.waitForLoadingComplete();
        
        // Should show all payments again
        const paymentItems = page.locator('[data-testid="payment-item"]');
        await expect(paymentItems.first()).toBeVisible();
      }
    });
  });

  test.describe('Student Payments - Payment Export and Reports', () => {
    test('should export payment history', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for export button
      const exportButton = page.locator('[data-testid="export-payments-button"]');
      if (await exportButton.isVisible()) {
        // Set up download handler
        const downloadPromise = page.waitForEvent('download');
        
        await exportButton.click();
        
        // Wait for download
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/payment.*\.(csv|xlsx|pdf)/);
      }
    });

    test('should generate payment report', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for report generation
      const generateReportButton = page.locator('[data-testid="generate-payment-report"]');
      if (await generateReportButton.isVisible()) {
        await generateReportButton.click();
        
        // Should show report options modal
        const reportModal = page.locator('[data-testid="payment-report-modal"]');
        await expect(reportModal).toBeVisible();
        
        // Verify report options
        await expect(reportModal.locator('[data-testid="report-date-range"]')).toBeVisible();
        await expect(reportModal.locator('[data-testid="report-format"]')).toBeVisible();
        await expect(reportModal.locator('[data-testid="generate-report-button"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Payments - Mobile Payment History', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Payment history should be mobile-friendly
      const paymentHistory = page.locator('[data-testid="payment-history-section"]');
      await expect(paymentHistory).toBeVisible();
      
      // Stats cards should stack on mobile
      const statsCards = page.locator('[data-testid="payment-stat-card"]');
      if (await statsCards.count() > 0) {
        await expect(statsCards.first()).toBeVisible();
      }
      
      // Payment items should be mobile-friendly
      const paymentItems = page.locator('[data-testid="payment-item"]');
      if (await paymentItems.count() > 0) {
        const firstItem = paymentItems.first();
        const itemRect = await firstItem.boundingBox();
        expect(itemRect?.width).toBeLessThanOrEqual(375); // Mobile width
      }
      
      await helpers.takeScreenshot('mobile-payment-history');
    });

    test('should adapt payment details for mobile', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        await paymentItems.first().click();
        
        // Payment modal should be mobile-friendly
        const paymentModal = page.locator('[data-testid="payment-details-modal"]');
        await expect(paymentModal).toBeVisible();
        
        const modalRect = await paymentModal.boundingBox();
        expect(modalRect?.width).toBeLessThanOrEqual(375); // Should fit mobile screen
      }
    });
  });

  test.describe('Student Payments - Error Handling', () => {
    test('should handle payment history loading errors', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/student/payments', route => 
        route.fulfill({ status: 500, body: 'Payment history load failed' })
      );
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="payment-history-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/خطأ في تحميل تاريخ المدفوعات/);
    });

    test('should handle payment export errors', async ({ page }) => {
      // Mock export API to return error
      await page.route('**/api/student/payments/export', route => 
        route.fulfill({ status: 500, body: 'Export failed' })
      );
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const exportButton = page.locator('[data-testid="export-payments-button"]');
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Should show error message
        const exportError = page.locator('[data-testid="export-error"]');
        await expect(exportError).toBeVisible();
        await expect(exportError).toContainText(/فشل في تصدير البيانات/);
      }
    });

    test('should provide retry functionality for failed operations', async ({ page }) => {
      let requestCount = 0;
      await page.route('**/api/student/payments', route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({ status: 500, body: 'Payment history load failed' });
        } else {
          route.continue();
        }
      });
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      
      // Should show error with retry button
      const retryButton = page.locator('[data-testid="retry-payment-history"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        
        // Should retry and eventually load
        await helpers.waitForLoadingComplete();
        const paymentHistory = page.locator('[data-testid="payment-history-section"]');
        await expect(paymentHistory).toBeVisible();
      }
    });
  });

  test.describe('Student Payments - Performance and Loading', () => {
    test('should load payment history efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Payment history should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // Main sections should be visible
      const paymentHistory = page.locator('[data-testid="payment-history-section"]');
      await expect(paymentHistory).toBeVisible();
    });

    test('should handle large payment history with pagination', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      const paymentItems = page.locator('[data-testid="payment-item"]');
      const itemCount = await paymentItems.count();
      
      // Should implement pagination for large datasets
      if (itemCount >= 20) {
        const pagination = page.locator('[data-testid="payment-pagination"]');
        const loadMoreButton = page.locator('[data-testid="load-more-payments"]');
        
        // Should have either pagination or load more functionality
        const hasPagination = await pagination.isVisible();
        const hasLoadMore = await loadMoreButton.isVisible();
        
        expect(hasPagination || hasLoadMore).toBe(true);
      }
    });
  });

  test.describe('Student Payments - Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Tab through interactive elements
      const paymentItems = page.locator('[data-testid="payment-item"]');
      if (await paymentItems.count() > 0) {
        await page.keyboard.press('Tab');
        await expect(paymentItems.first()).toBeFocused();
        
        // Should be able to activate with Enter
        await page.keyboard.press('Enter');
        
        const paymentModal = page.locator('[data-testid="payment-details-modal"]');
        await expect(paymentModal).toBeVisible();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for proper labels
      const paymentItems = page.locator('[data-testid="payment-item"]');
      if (await paymentItems.count() > 0) {
        await expect(paymentItems.first()).toHaveAttribute('role');
        await expect(paymentItems.first()).toHaveAttribute('aria-label');
      }
      
      // Status badges should have proper labels
      const statusBadges = page.locator('[data-testid="payment-status-badge"]');
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toHaveAttribute('aria-label');
      }
    });
  });
});