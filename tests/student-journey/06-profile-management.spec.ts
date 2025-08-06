import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, SUCCESS_MESSAGES } from '../utils/test-data';

test.describe('Student Journey - Profile Management', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login(TEST_USERS.STUDENT);
  });

  test.describe('Student Profile - Profile Information Display', () => {
    test('should display complete profile information', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Verify page title
      await expect(page).toHaveTitle(/الملف الشخصي/);
      
      // Check profile header
      const profileHeader = page.locator('[data-testid="profile-header"]');
      await expect(profileHeader).toBeVisible();
      
      // Verify user information
      await expect(profileHeader.locator('[data-testid="user-name"]')).toContainText(TEST_USERS.STUDENT.name);
      await expect(profileHeader.locator('[data-testid="user-role"]')).toContainText('طالب');
      
      // Check enrollment count
      const enrollmentCount = profileHeader.locator('[data-testid="enrollment-count"]');
      if (await enrollmentCount.isVisible()) {
        const countText = await enrollmentCount.textContent();
        expect(countText).toMatch(/\d+/);
      }
      
      await helpers.takeScreenshot('profile-information');
    });

    test('should show user avatar or initials', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const profileHeader = page.locator('[data-testid="profile-header"]');
      
      // Should have either avatar image or initials
      const avatar = profileHeader.locator('[data-testid="user-avatar"]');
      const initials = profileHeader.locator('[data-testid="user-initials"]');
      
      const hasAvatar = await avatar.isVisible();
      const hasInitials = await initials.isVisible();
      
      expect(hasAvatar || hasInitials).toBe(true);
      
      if (hasInitials) {
        const initialsText = await initials.textContent();
        expect(initialsText).toMatch(/[أ-ي]{1,2}/); // Arabic initials
      }
    });

    test('should display contact information', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check contact information section
      const contactInfo = page.locator('[data-testid="contact-info"]');
      if (await contactInfo.isVisible()) {
        // Phone number should be displayed
        const phoneNumber = contactInfo.locator('[data-testid="phone-number"]');
        await expect(phoneNumber).toBeVisible();
        await expect(phoneNumber).toContainText(TEST_USERS.STUDENT.phone);
        
        // Email if available
        const email = contactInfo.locator('[data-testid="email"]');
        if (await email.isVisible()) {
          await expect(email).toContainText(TEST_USERS.STUDENT.email!);
        }
        
        // Student ID if available
        const studentId = contactInfo.locator('[data-testid="student-id"]');
        if (await studentId.isVisible()) {
          const idText = await studentId.textContent();
          expect(idText).toMatch(/\d+/);
        }
      }
    });
  });

  test.describe('Student Profile - Quick Access Card', () => {
    test('should display most recent course', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check quick access card
      const quickAccessCard = page.locator('[data-testid="quick-access-card"]');
      if (await quickAccessCard.isVisible()) {
        await expect(quickAccessCard).toBeVisible();
        
        // Should show recent course information
        const recentCourse = quickAccessCard.locator('[data-testid="recent-course"]');
        if (await recentCourse.isVisible()) {
          await expect(recentCourse.locator('[data-testid="course-title"]')).toBeVisible();
          await expect(recentCourse.locator('[data-testid="course-progress"]')).toBeVisible();
          await expect(recentCourse.locator('[data-testid="continue-button"]')).toBeVisible();
        }
      }
    });

    test('should allow continuing from recent course', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const quickAccessCard = page.locator('[data-testid="quick-access-card"]');
      if (await quickAccessCard.isVisible()) {
        const continueButton = quickAccessCard.locator('[data-testid="continue-button"]');
        if (await continueButton.isVisible()) {
          await continueButton.click();
          
          // Should navigate to course learning page
          await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+\/learn/);
        }
      }
    });

    test('should show appropriate message when no courses enrolled', async ({ page }) => {
      // This test would require a user with no enrollments
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const quickAccessCard = page.locator('[data-testid="quick-access-card"]');
      if (await quickAccessCard.isVisible()) {
        const noCourses = quickAccessCard.locator('[data-testid="no-courses-message"]');
        if (await noCourses.isVisible()) {
          await expect(noCourses).toContainText(/لم تسجل في أي دورة بعد/);
          
          // Should have link to browse courses
          const browseCourses = quickAccessCard.locator('[data-testid="browse-courses-link"]');
          await expect(browseCourses).toBeVisible();
        }
      }
    });
  });

  test.describe('Student Profile - Enrolled Courses Section', () => {
    test('should display all enrolled courses', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check enrolled courses section
      const enrolledCoursesSection = page.locator('[data-testid="enrolled-courses-section"]');
      await expect(enrolledCoursesSection).toBeVisible();
      
      const courseCards = enrolledCoursesSection.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        
        // Verify course card structure
        await expect(firstCourse.locator('[data-testid="course-thumbnail"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-title"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-professor"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="course-progress"]')).toBeVisible();
        await expect(firstCourse.locator('[data-testid="enrollment-date"]')).toBeVisible();
      }
    });

    test('should show course progress accurately', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        
        // Check progress information
        const progressBar = firstCourse.locator('[data-testid="progress-bar"]');
        const progressText = firstCourse.locator('[data-testid="progress-text"]');
        const lessonsCompleted = firstCourse.locator('[data-testid="lessons-completed"]');
        const totalLessons = firstCourse.locator('[data-testid="total-lessons"]');
        
        await expect(progressBar).toBeVisible();
        await expect(progressText).toBeVisible();
        
        const progressValue = await progressText.textContent();
        expect(progressValue).toMatch(/\d+%/);
        
        if (await lessonsCompleted.isVisible() && await totalLessons.isVisible()) {
          const completedText = await lessonsCompleted.textContent();
          const totalText = await totalLessons.textContent();
          
          expect(completedText).toMatch(/\d+/);
          expect(totalText).toMatch(/\d+/);
        }
      }
    });

    test('should allow accessing course from profile', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCourse = courseCards.first();
        await firstCourse.click();
        
        // Should navigate to course page or learning interface
        const isOnCoursePage = await page.url().includes('/courses/');
        expect(isOnCoursePage).toBe(true);
      }
    });

    test('should show enrollment dates correctly', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const enrollmentDate = courseCards.first().locator('[data-testid="enrollment-date"]');
        if (await enrollmentDate.isVisible()) {
          const dateText = await enrollmentDate.textContent();
          expect(dateText).toMatch(/\d{4}\/\d{1,2}\/\d{1,2}/);
        }
      }
    });
  });

  test.describe('Student Profile - Certificates Section', () => {
    test('should display earned certificates', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check certificates section
      const certificatesSection = page.locator('[data-testid="certificates-section"]');
      await expect(certificatesSection).toBeVisible();
      
      const certificateCards = certificatesSection.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        const firstCertificate = certificateCards.first();
        
        // Verify certificate information
        await expect(firstCertificate.locator('[data-testid="certificate-course"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="certificate-date"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="certificate-code"]')).toBeVisible();
        await expect(firstCertificate.locator('[data-testid="certificate-status"]')).toBeVisible();
      } else {
        // Should show empty state
        const emptyCertificates = certificatesSection.locator('[data-testid="no-certificates"]');
        await expect(emptyCertificates).toBeVisible();
        await expect(emptyCertificates).toContainText(/لم تحصل على شهادات بعد/);
      }
    });

    test('should allow downloading certificates', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const certificateCards = page.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        const downloadButton = certificateCards.first().locator('[data-testid="download-certificate"]');
        if (await downloadButton.isVisible()) {
          // Set up download handler
          const downloadPromise = page.waitForEvent('download');
          
          await downloadButton.click();
          
          // Wait for download
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toContain('certificate');
        }
      }
    });

    test('should show certificate verification codes', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const certificateCards = page.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        const certificateCode = certificateCards.first().locator('[data-testid="certificate-code"]');
        if (await certificateCode.isVisible()) {
          const codeText = await certificateCode.textContent();
          expect(codeText).toMatch(/[A-Z0-9-]+/); // Should be alphanumeric code
        }
      }
    });

    test('should allow verifying certificates', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const certificateCards = page.locator('[data-testid="certificate-card"]');
      
      if (await certificateCards.count() > 0) {
        const verifyButton = certificateCards.first().locator('[data-testid="verify-certificate"]');
        if (await verifyButton.isVisible()) {
          await verifyButton.click();
          
          // Should navigate to verification page
          await expect(page).toHaveURL(/\/certificates\/verify/);
        }
      }
    });
  });

  test.describe('Student Profile - Exam History Section', () => {
    test('should display exam history if available', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check exam history section
      const examHistorySection = page.locator('[data-testid="exam-history-section"]');
      if (await examHistorySection.isVisible()) {
        await expect(examHistorySection).toBeVisible();
        
        const examItems = examHistorySection.locator('[data-testid="exam-item"]');
        
        if (await examItems.count() > 0) {
          const firstExam = examItems.first();
          
          // Verify exam information
          await expect(firstExam.locator('[data-testid="exam-course"]')).toBeVisible();
          await expect(firstExam.locator('[data-testid="exam-score"]')).toBeVisible();
          await expect(firstExam.locator('[data-testid="exam-date"]')).toBeVisible();
          await expect(firstExam.locator('[data-testid="exam-status"]')).toBeVisible();
        }
      }
    });

    test('should show exam scores correctly', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const examItems = page.locator('[data-testid="exam-item"]');
      
      if (await examItems.count() > 0) {
        const examScore = examItems.first().locator('[data-testid="exam-score"]');
        if (await examScore.isVisible()) {
          const scoreText = await examScore.textContent();
          expect(scoreText).toMatch(/\d+%|\d+\/\d+/); // Percentage or fraction
        }
      }
    });

    test('should handle empty exam history', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const examHistorySection = page.locator('[data-testid="exam-history-section"]');
      if (await examHistorySection.isVisible()) {
        const noExams = examHistorySection.locator('[data-testid="no-exams"]');
        if (await noExams.isVisible()) {
          await expect(noExams).toContainText(/لم تخض أي امتحانات بعد/);
        }
      }
    });
  });

  test.describe('Student Profile - Profile Actions', () => {
    test('should display profile action buttons', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check profile actions section
      const profileActions = page.locator('[data-testid="profile-actions"]');
      await expect(profileActions).toBeVisible();
      
      // Should have edit profile button
      const editProfileButton = profileActions.locator('[data-testid="edit-profile-button"]');
      await expect(editProfileButton).toBeVisible();
      
      // Should have settings button
      const settingsButton = profileActions.locator('[data-testid="settings-button"]');
      if (await settingsButton.isVisible()) {
        await expect(settingsButton).toBeVisible();
      }
      
      // Should have logout button
      const logoutButton = profileActions.locator('[data-testid="logout-button"]');
      if (await logoutButton.isVisible()) {
        await expect(logoutButton).toBeVisible();
      }
    });

    test('should open edit profile modal', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const editProfileButton = page.locator('[data-testid="edit-profile-button"]');
      await editProfileButton.click();
      
      // Should open edit profile modal
      const editModal = page.locator('[data-testid="edit-profile-modal"]');
      await expect(editModal).toBeVisible();
      
      // Verify form fields
      await expect(editModal.locator('[data-testid="name-input"]')).toBeVisible();
      await expect(editModal.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(editModal.locator('[data-testid="phone-input"]')).toBeVisible();
      
      await helpers.takeScreenshot('edit-profile-modal');
    });

    test('should update profile information', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const editProfileButton = page.locator('[data-testid="edit-profile-button"]');
      await editProfileButton.click();
      
      const editModal = page.locator('[data-testid="edit-profile-modal"]');
      
      // Update name
      const nameInput = editModal.locator('[data-testid="name-input"]');
      await nameInput.clear();
      await nameInput.fill('اسم محدث للاختبار');
      
      // Update email
      const emailInput = editModal.locator('[data-testid="email-input"]');
      if (await emailInput.isVisible()) {
        await emailInput.clear();
        await emailInput.fill('updated@test.com');
      }
      
      // Save changes
      const saveButton = editModal.locator('[data-testid="save-profile-button"]');
      await saveButton.click();
      
      // Should show success message
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      
      // Modal should close
      await expect(editModal).not.toBeVisible();
      
      // Profile should reflect changes
      await page.reload();
      await helpers.waitForLoadingComplete();
      
      const userName = page.locator('[data-testid="user-name"]');
      await expect(userName).toContainText('اسم محدث للاختبار');
    });

    test('should validate profile form fields', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const editProfileButton = page.locator('[data-testid="edit-profile-button"]');
      await editProfileButton.click();
      
      const editModal = page.locator('[data-testid="edit-profile-modal"]');
      
      // Clear required field
      const nameInput = editModal.locator('[data-testid="name-input"]');
      await nameInput.clear();
      
      // Try to save
      const saveButton = editModal.locator('[data-testid="save-profile-button"]');
      await saveButton.click();
      
      // Should show validation error
      const nameError = editModal.locator('[data-testid="name-error"]');
      await expect(nameError).toBeVisible();
      await expect(nameError).toContainText(/الاسم مطلوب/);
    });

    test('should handle profile update errors', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/profile/update', route => 
        route.fulfill({ status: 500, body: 'Update failed' })
      );
      
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const editProfileButton = page.locator('[data-testid="edit-profile-button"]');
      await editProfileButton.click();
      
      const editModal = page.locator('[data-testid="edit-profile-modal"]');
      const saveButton = editModal.locator('[data-testid="save-profile-button"]');
      await saveButton.click();
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/فشل في تحديث الملف الشخصي/);
    });
  });

  test.describe('Student Profile - Settings and Preferences', () => {
    test('should access settings page', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const settingsButton = page.locator('[data-testid="settings-button"]');
      if (await settingsButton.isVisible()) {
        await settingsButton.click();
        
        // Should navigate to settings page or open settings modal
        const isOnSettingsPage = await page.url().includes('/settings');
        const isSettingsModalVisible = await page.locator('[data-testid="settings-modal"]').isVisible();
        
        expect(isOnSettingsPage || isSettingsModalVisible).toBe(true);
      }
    });

    test('should allow changing password', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const changePasswordButton = page.locator('[data-testid="change-password-button"]');
      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click();
        
        // Should open change password modal
        const passwordModal = page.locator('[data-testid="change-password-modal"]');
        await expect(passwordModal).toBeVisible();
        
        // Verify form fields
        await expect(passwordModal.locator('[data-testid="current-password"]')).toBeVisible();
        await expect(passwordModal.locator('[data-testid="new-password"]')).toBeVisible();
        await expect(passwordModal.locator('[data-testid="confirm-password"]')).toBeVisible();
      }
    });

    test('should validate password change form', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const changePasswordButton = page.locator('[data-testid="change-password-button"]');
      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click();
        
        const passwordModal = page.locator('[data-testid="change-password-modal"]');
        
        // Fill with mismatched passwords
        await passwordModal.locator('[data-testid="current-password"]').fill('currentpass');
        await passwordModal.locator('[data-testid="new-password"]').fill('newpass123');
        await passwordModal.locator('[data-testid="confirm-password"]').fill('differentpass');
        
        const saveButton = passwordModal.locator('[data-testid="save-password-button"]');
        await saveButton.click();
        
        // Should show validation error
        const confirmError = passwordModal.locator('[data-testid="confirm-password-error"]');
        await expect(confirmError).toBeVisible();
        await expect(confirmError).toContainText(/كلمات المرور غير متطابقة/);
      }
    });
  });

  test.describe('Student Profile - Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Profile should be mobile-friendly
      const profileHeader = page.locator('[data-testid="profile-header"]');
      await expect(profileHeader).toBeVisible();
      
      // Sections should stack vertically on mobile
      const enrolledCourses = page.locator('[data-testid="enrolled-courses-section"]');
      await expect(enrolledCourses).toBeVisible();
      
      // Action buttons should be accessible
      const profileActions = page.locator('[data-testid="profile-actions"]');
      await expect(profileActions).toBeVisible();
      
      await helpers.takeScreenshot('mobile-profile');
    });

    test('should adapt course cards for mobile', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      
      if (await courseCards.count() > 0) {
        const firstCard = courseCards.first();
        
        // Course cards should be mobile-friendly
        const cardRect = await firstCard.boundingBox();
        expect(cardRect?.width).toBeLessThanOrEqual(375); // Mobile width
        
        // All elements should still be visible
        await expect(firstCard.locator('[data-testid="course-title"]')).toBeVisible();
        await expect(firstCard.locator('[data-testid="course-progress"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Profile - Performance and Loading', () => {
    test('should load profile data efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Profile should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // Main sections should be visible
      await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="enrolled-courses-section"]')).toBeVisible();
    });

    test('should handle large numbers of enrolled courses', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      const courseCount = await courseCards.count();
      
      // Should handle pagination or lazy loading for many courses
      if (courseCount > 10) {
        const pagination = page.locator('[data-testid="courses-pagination"]');
        const loadMoreButton = page.locator('[data-testid="load-more-courses"]');
        
        // Should have either pagination or load more functionality
        const hasPagination = await pagination.isVisible();
        const hasLoadMore = await loadMoreButton.isVisible();
        
        expect(hasPagination || hasLoadMore).toBe(true);
      }
    });
  });

  test.describe('Student Profile - Error Handling', () => {
    test('should handle profile loading errors', async ({ page }) => {
      // Mock API to return error
      await page.route('**/api/profile', route => 
        route.fulfill({ status: 500, body: 'Profile load failed' })
      );
      
      await helpers.navigateAndWait('/profile');
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="profile-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/خطأ في تحميل الملف الشخصي/);
    });

    test('should provide retry functionality', async ({ page }) => {
      let requestCount = 0;
      await page.route('**/api/profile', route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({ status: 500, body: 'Profile load failed' });
        } else {
          route.continue();
        }
      });
      
      await helpers.navigateAndWait('/profile');
      
      // Should show error with retry button
      const retryButton = page.locator('[data-testid="retry-profile-button"]');
      if (await retryButton.isVisible()) {
        await retryButton.click();
        
        // Should retry and eventually load
        await helpers.waitForLoadingComplete();
        await expect(page.locator('[data-testid="profile-header"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Profile - Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // Edit profile button
      await expect(page.locator('[data-testid="edit-profile-button"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Settings button
      const settingsButton = page.locator('[data-testid="settings-button"]');
      if (await settingsButton.isVisible()) {
        await expect(settingsButton).toBeFocused();
      }
      
      // Course cards should be focusable
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      if (await courseCards.count() > 0) {
        await page.keyboard.press('Tab');
        await expect(courseCards.first()).toBeFocused();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.navigateAndWait('/profile');
      await helpers.waitForLoadingComplete();
      
      // Check for proper labels
      const editButton = page.locator('[data-testid="edit-profile-button"]');
      await expect(editButton).toHaveAttribute('aria-label');
      
      // Course cards should have proper roles
      const courseCards = page.locator('[data-testid="enrolled-course-card"]');
      if (await courseCards.count() > 0) {
        await expect(courseCards.first()).toHaveAttribute('role');
      }
      
      // Progress bars should have proper labels
      const progressBars = page.locator('[data-testid="progress-bar"]');
      if (await progressBars.count() > 0) {
        await expect(progressBars.first()).toHaveAttribute('aria-label');
      }
    });
  });
});