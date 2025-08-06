import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, NAVIGATION_ITEMS } from '../utils/test-data';

test.describe('Student Journey - Student Dashboard', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login(TEST_USERS.STUDENT);
  });

  test.describe('Student Dashboard - Overview and Navigation', () => {
    test('should display dashboard with correct title and layout', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Verify page title and main heading
      await expect(page).toHaveTitle(/لوحة تحكم الطالب/);
      await expect(page.locator('h1')).toContainText('لوحة تحكم الطالب');
      
      // Verify main dashboard sections are visible
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard-tabs"]')).toBeVisible();
      
      // Verify navigation tabs
      const tabs = page.locator('[data-testid="dashboard-tab"]');
      await expect(tabs).toHaveCount(6); // overview, courses, progress, payments, recommended, certificates
      
      await helpers.takeScreenshot('dashboard-overview');
    });

    test('should show current date and welcome message', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check for date display
      const dateDisplay = page.locator('[data-testid="current-date"]');
      if (await dateDisplay.isVisible()) {
        const dateText = await dateDisplay.textContent();
        expect(dateText).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
      }
      
      // Check for welcome message or user name
      const welcomeMessage = page.locator('[data-testid="welcome-message"]');
      if (await welcomeMessage.isVisible()) {
        await expect(welcomeMessage).toContainText(TEST_USERS.STUDENT.name);
      }
    });

    test('should navigate between dashboard tabs', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const tabs = ['overview', 'courses', 'progress', 'payments', 'recommended', 'certificates'];
      
      for (const tab of tabs) {
        const tabButton = page.locator(`[data-testid="tab-${tab}"]`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await helpers.waitForLoadingComplete();
          
          // Verify tab content is displayed
          const tabContent = page.locator(`[data-testid="tab-content-${tab}"]`);
          await expect(tabContent).toBeVisible();
          
          // Verify URL reflects active tab
          if (tab !== 'overview') {
            await expect(page).toHaveURL(new RegExp(`tab=${tab}`));
          }
        }
      }
    });
  });

  test.describe('Student Dashboard - Statistics Cards', () => {
    test('should display enrollment statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check enrolled courses card
      const enrolledCoursesCard = page.locator('[data-testid="enrolled-courses-card"]');
      await expect(enrolledCoursesCard).toBeVisible();
      
      const enrolledCount = await enrolledCoursesCard.locator('[data-testid="enrolled-count"]').textContent();
      expect(enrolledCount).toMatch(/\d+/);
      
      // Check completed/in-progress breakdown
      const completedCount = enrolledCoursesCard.locator('[data-testid="completed-count"]');
      const inProgressCount = enrolledCoursesCard.locator('[data-testid="in-progress-count"]');
      
      if (await completedCount.isVisible()) {
        const completedText = await completedCount.textContent();
        expect(completedText).toMatch(/\d+/);
      }
      
      if (await inProgressCount.isVisible()) {
        const inProgressText = await inProgressCount.textContent();
        expect(inProgressText).toMatch(/\d+/);
      }
    });

    test('should display progress statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check average progress card
      const progressCard = page.locator('[data-testid="average-progress-card"]');
      await expect(progressCard).toBeVisible();
      
      const progressPercentage = await progressCard.locator('[data-testid="progress-percentage"]').textContent();
      expect(progressPercentage).toMatch(/\d+(\.\d+)?%/);
      
      // Check progress bar
      const progressBar = progressCard.locator('[data-testid="progress-bar"]');
      await expect(progressBar).toBeVisible();
      
      const progressValue = await progressBar.getAttribute('style');
      expect(progressValue).toContain('width:');
    });

    test('should display learning time statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check watch time card
      const watchTimeCard = page.locator('[data-testid="watch-time-card"]');
      await expect(watchTimeCard).toBeVisible();
      
      const watchTime = await watchTimeCard.locator('[data-testid="watch-time-value"]').textContent();
      expect(watchTime).toMatch(/\d+[سد]/); // Arabic time format (hours/minutes)
      
      // Verify time format is reasonable
      expect(watchTime).toContain('س'); // Should contain hours or minutes indicator
    });

    test('should display certificates statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check certificates card
      const certificatesCard = page.locator('[data-testid="certificates-card"]');
      await expect(certificatesCard).toBeVisible();
      
      const certificateCount = await certificatesCard.locator('[data-testid="certificate-count"]').textContent();
      expect(certificateCount).toMatch(/\d+/);
    });

    test('should display spending statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check total spending card
      const spendingCard = page.locator('[data-testid="total-spending-card"]');
      await expect(spendingCard).toBeVisible();
      
      const totalSpent = await spendingCard.locator('[data-testid="total-spent"]').textContent();
      expect(totalSpent).toMatch(/\d+.*جنيه|EGP/); // Should show currency
    });

    test('should display learning streak', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check learning streak card
      const streakCard = page.locator('[data-testid="learning-streak-card"]');
      await expect(streakCard).toBeVisible();
      
      const streakDays = await streakCard.locator('[data-testid="streak-days"]').textContent();
      expect(streakDays).toMatch(/\d+/);
      
      const streakText = await streakCard.locator('[data-testid="streak-text"]').textContent();
      expect(streakText).toContain('يوم متتالي');
    });

    test('should display achievements count', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check achievements card
      const achievementsCard = page.locator('[data-testid="achievements-card"]');
      await expect(achievementsCard).toBeVisible();
      
      const achievementCount = await achievementsCard.locator('[data-testid="achievement-count"]').textContent();
      expect(achievementCount).toMatch(/\d+/);
    });

    test('should display activity rate', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check activity rate card
      const activityCard = page.locator('[data-testid="activity-rate-card"]');
      await expect(activityCard).toBeVisible();
      
      const activityRate = await activityCard.locator('[data-testid="activity-rate"]').textContent();
      expect(activityRate).toMatch(/\d+%/);
    });
  });

  test.describe('Student Dashboard - Recent Activity', () => {
    test('should display recent learning activity', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check recent activity section
      const recentActivity = page.locator('[data-testid="recent-activity"]');
      await expect(recentActivity).toBeVisible();
      
      const activityItems = recentActivity.locator('[data-testid="activity-item"]');
      
      if (await activityItems.count() > 0) {
        // Verify activity item structure
        const firstActivity = activityItems.first();
        await expect(firstActivity.locator('[data-testid="activity-icon"]')).toBeVisible();
        await expect(firstActivity.locator('[data-testid="activity-description"]')).toBeVisible();
        await expect(firstActivity.locator('[data-testid="activity-timestamp"]')).toBeVisible();
        
        // Verify activity types
        const activityDescription = await firstActivity.locator('[data-testid="activity-description"]').textContent();
        const validActivityTypes = ['أكملت درس', 'سجلت في دورة', 'حصلت على شهادة', 'نجحت في اختبار'];
        const hasValidType = validActivityTypes.some(type => activityDescription?.includes(type));
        expect(hasValidType).toBe(true);
      }
    });

    test('should show activity timestamps correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const recentActivity = page.locator('[data-testid="recent-activity"]');
      const activityItems = recentActivity.locator('[data-testid="activity-item"]');
      
      if (await activityItems.count() > 0) {
        const timestamp = await activityItems.first().locator('[data-testid="activity-timestamp"]').textContent();
        
        // Should be a valid date format
        expect(timestamp).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
      }
    });

    test('should limit recent activity items', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const recentActivity = page.locator('[data-testid="recent-activity"]');
      const activityItems = recentActivity.locator('[data-testid="activity-item"]');
      
      const itemCount = await activityItems.count();
      
      // Should show reasonable number of recent items (typically 5-10)
      expect(itemCount).toBeLessThanOrEqual(10);
    });
  });

  test.describe('Student Dashboard - Achievements Section', () => {
    test('should display recent achievements', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check achievements section
      const achievementsSection = page.locator('[data-testid="recent-achievements"]');
      await expect(achievementsSection).toBeVisible();
      
      const achievementItems = achievementsSection.locator('[data-testid="achievement-item"]');
      
      if (await achievementItems.count() > 0) {
        const firstAchievement = achievementItems.first();
        
        // Verify achievement structure
        await expect(firstAchievement.locator('[data-testid="achievement-icon"]')).toBeVisible();
        await expect(firstAchievement.locator('[data-testid="achievement-title"]')).toBeVisible();
        await expect(firstAchievement.locator('[data-testid="achievement-description"]')).toBeVisible();
        await expect(firstAchievement.locator('[data-testid="achievement-category"]')).toBeVisible();
        
        // Verify achievement categories
        const category = await firstAchievement.locator('[data-testid="achievement-category"]').textContent();
        const validCategories = ['إكمال', 'استمرارية', 'تفاعل', 'تميز'];
        const hasValidCategory = validCategories.some(cat => category?.includes(cat));
        expect(hasValidCategory).toBe(true);
      }
    });

    test('should show achievement badges correctly', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const achievementsSection = page.locator('[data-testid="recent-achievements"]');
      const achievementItems = achievementsSection.locator('[data-testid="achievement-item"]');
      
      if (await achievementItems.count() > 0) {
        const badge = achievementItems.first().locator('[data-testid="achievement-category"]');
        
        // Badge should have appropriate styling
        const badgeClasses = await badge.getAttribute('class');
        expect(badgeClasses).toContain('badge');
      }
    });
  });

  test.describe('Student Dashboard - Courses Tab', () => {
    test('should display enrolled courses', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Navigate to courses tab
      const coursesTab = page.locator('[data-testid="tab-courses"]');
      await coursesTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check enrolled courses section
      const enrolledCourses = page.locator('[data-testid="enrolled-courses-section"]');
      await expect(enrolledCourses).toBeVisible();
      
      const courseCards = enrolledCourses.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        
        // Verify course card structure
        await expect(firstCourse.locator('[data-testid="course-thumbnail"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-title"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-progress"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="continue-learning-button"]')).toBeVisible();
      }
    });

    test('should show course progress accurately', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const coursesTab = page.locator('[data-testid="tab-courses"]');
      await coursesTab.click();
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        const progressBar = firstCourse.locator('[data-testid="course-progress-bar"]');
        const progressText = firstCourse.locator('[data-testid="course-progress-text"]');
        
        await expect(progressBar).toBeVisible();
        await expect(progressText).toBeVisible();
        
        const progressValue = await progressText.textContent();
        expect(progressValue).toMatch(/\d+%/);
        
        // Progress bar should reflect the percentage
        const progressStyle = await progressBar.getAttribute('style');
        expect(progressStyle).toContain('width:');
      }
    });

    test('should allow continuing course from dashboard', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const coursesTab = page.locator('[data-testid="tab-courses"]');
      await coursesTab.click();
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const continueButton = courseCards.first().locator('[data-testid="continue-learning-button"]');
        await continueButton.click();
        
        // Should navigate to course learning page
        await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+\/learn/);
      }
    });
  });

  test.describe('Student Dashboard - Progress Tab', () => {
    test('should display detailed progress information', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const progressTab = page.locator('[data-testid="tab-progress"]');
      await progressTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check progress overview
      const progressOverview = page.locator('[data-testid="progress-overview"]');
      await expect(progressOverview).toBeVisible();
      
      // Check individual course progress
      const courseProgressItems = page.locator('[data-testid="course-progress-item"]');
      
      if (await courseProgressItems.count() > 0) {
        const firstItem = courseProgressItems.first();
        
        await expect(firstItem.locator('[data-testid="course-name"]')).toBeVisible();
        await expect(firstItem.locator('[data-testid="lessons-completed"]')).toBeVisible();
        await expect(firstItem.locator('[data-testid="total-lessons"]')).toBeVisible();
        await expect(firstItem.locator('[data-testid="completion-percentage"]')).toBeVisible();
      }
    });

    test('should show learning analytics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const progressTab = page.locator('[data-testid="tab-progress"]');
      await progressTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check for analytics charts/graphs
      const analyticsSection = page.locator('[data-testid="learning-analytics"]');
      if (await analyticsSection.isVisible()) {
        // Should show learning patterns, time spent, etc.
        const timeSpentChart = analyticsSection.locator('[data-testid="time-spent-chart"]');
        const progressChart = analyticsSection.locator('[data-testid="progress-chart"]');
        
        if (await timeSpentChart.isVisible()) {
          await expect(timeSpentChart).toBeVisible();
        }
        
        if (await progressChart.isVisible()) {
          await expect(progressChart).toBeVisible();
        }
      }
    });
  });

  test.describe('Student Dashboard - Payments Tab', () => {
    test('should display payment history', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check payment history section
      const paymentHistory = page.locator('[data-testid="payment-history-section"]');
      await expect(paymentHistory).toBeVisible();
      
      const paymentItems = paymentHistory.locator('[data-testid="payment-item"]');
      
      if (await paymentItems.count() > 0) {
        const firstPayment = paymentItems.first();
        
        // Verify payment item structure
        await expect(firstPayment.locator('[data-testid="payment-course"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-amount"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-status"]')).toBeVisible();
        await expect(firstPayment.locator('[data-testid="payment-date"]')).toBeVisible();
      }
    });

    test('should show payment statistics', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const paymentsTab = page.locator('[data-testid="tab-payments"]');
      await paymentsTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check payment stats cards
      const paymentStats = page.locator('[data-testid="payment-stats"]');
      await expect(paymentStats).toBeVisible();
      
      const statsCards = paymentStats.locator('[data-testid="payment-stat-card"]');
      
      if (await statsCards.count() > 0) {
        // Should show total spent, successful payments, etc.
        const totalSpentCard = statsCards.filter({ hasText: 'إجمالي الإنفاق' });
        const successfulPaymentsCard = statsCards.filter({ hasText: 'المعاملات الناجحة' });
        
        if (await totalSpentCard.count() > 0) {
          await expect(totalSpentCard.first()).toBeVisible();
        }
        
        if (await successfulPaymentsCard.count() > 0) {
          await expect(successfulPaymentsCard.first()).toBeVisible();
        }
      }
    });
  });

  test.describe('Student Dashboard - Recommended Courses Tab', () => {
    test('should display recommended courses', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const recommendedTab = page.locator('[data-testid="tab-recommended"]');
      await recommendedTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check recommended courses section
      const recommendedCourses = page.locator('[data-testid="recommended-courses-section"]');
      await expect(recommendedCourses).toBeVisible();
      
      const courseCards = recommendedCourses.locator('[data-testid="recommended-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        
        // Verify course card structure
        await expect(firstCourse.locator('[data-testid="course-thumbnail"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-title"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-price"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-rating"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="enroll-button"]')).toBeVisible();
      }
    });

    test('should allow enrolling in recommended courses', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const recommendedTab = page.locator('[data-testid="tab-recommended"]');
      await recommendedTab.click();
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="recommended-course-card"]');
      
      if (await courseCards.count() > 0) {
        const enrollButton = courseCards.first().locator('[data-testid="enroll-button"]');
        await enrollButton.click();
        
        // Should either navigate to course page or show enrollment modal
        const isOnCoursePage = await page.url().includes('/courses/');
        const isModalVisible = await page.locator('[data-testid="enrollment-modal"]').isVisible();
        
        expect(isOnCoursePage || isModalVisible).toBe(true);
      }
    });
  });

  test.describe('Student Dashboard - Certificates Tab', () => {
    test('should display earned certificates', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const certificatesTab = page.locator('[data-testid="tab-certificates"]');
      await certificatesTab.click();
      await helpers.waitForLoadingComplete();
      
      // Check certificates section
      const certificatesSection = page.locator('[data-testid="certificates-section"]');
      await expect(certificatesSection).toBeVisible();
      
      const certificateCards = certificatesSection.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        const firstCertificate = certificateCards.first();
        
        // Verify certificate card structure
        await expect(firstCertificate.locator('[data-testid="certificate-course"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="certificate-date"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="certificate-status"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="download-certificate"]')).toBeVisible();
      } else {
        // Should show empty state
        const emptyState = certificatesSection.locator('[data-testid="no-certificates"]');
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toContainText(/لم تحصل على شهادات بعد/);
      }
    });

    test('should allow downloading certificates', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const certificatesTab = page.locator('[data-testid="tab-certificates"]');
      await certificatesTab.click();
      await helpers.waitForLoadingComplete();
      
      const certificateCards = page.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        // Set up download handler
        const downloadPromise = page.waitForEvent('download');
        
        const downloadButton = certificateCards.first().locator('[data-testid="download-certificate"]');
        await downloadButton.click();
        
        // Wait for download to start
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toContain('certificate');
      }
    });
  });

  test.describe('Student Dashboard - Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Dashboard should be mobile-friendly
      await expect(page.locator('h1')).toBeVisible();
      
      // Stats cards should stack vertically on mobile
      const statsCards = page.locator('[data-testid="stat-card"]');
      if (await statsCards.count() > 0) {
        await expect(statsCards.first()).toBeVisible();
      }
      
      // Tabs should be scrollable on mobile
      const tabsList = page.locator('[data-testid="dashboard-tabs"]');
      await expect(tabsList).toBeVisible();
      
      await helpers.takeScreenshot('mobile-dashboard');
    });

    test('should adapt navigation for mobile', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check if mobile navigation menu exists
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      if (await mobileMenu.isVisible()) {
        await mobileMenu.click();
        
        // Should show navigation options
        const navItems = page.locator('[data-testid="mobile-nav-item"]');
        await expect(navItems.first()).toBeVisible();
      }
    });
  });

  test.describe('Student Dashboard - Performance and Loading', () => {
    test('should load dashboard data efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // All main sections should be visible
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
      await expect(page.locator('[data-testid="dashboard-tabs"]')).toBeVisible();
    });

    test('should handle slow API responses', async ({ page }) => {
      // Simulate slow API responses
      await page.route('**/api/student/dashboard-stats', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.continue();
      });
      
      await helpers.navigateAndWait('/dashboard');
      
      // Should show loading states
      const loadingIndicators = page.locator('[data-testid="loading"]');
      if (await loadingIndicators.count() > 0) {
        await expect(loadingIndicators.first()).toBeVisible();
      }
      
      // Eventually should load content
      await helpers.waitForLoadingComplete();
      await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
    });
  });

  test.describe('Student Dashboard - Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/student/dashboard-stats', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await helpers.navigateAndWait('/dashboard');
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="dashboard-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/خطأ في تحميل البيانات/);
    });

    test('should provide retry functionality on errors', async ({ page }) => {
      // Simulate API error initially
      let requestCount = 0;
      await page.route('**/api/student/dashboard-stats', route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({ status: 500, body: 'Internal Server Error' });
        } else {
          route.continue();
        }
      });
      
      await helpers.navigateAndWait('/dashboard');
      
      // Should show error with retry button
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        
        // Should retry and eventually load
        await helpers.waitForLoadingComplete();
        await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();
      }
    });
  });
});