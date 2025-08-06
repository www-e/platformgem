import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/test-data';

test.describe('Student Journey - Authentication Flow', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('Student Auth - Registration Process', () => {
    test('should successfully register a new student with all fields', async ({ page }) => {
      const testUser = TestHelpers.generateTestUser();
      
      await helpers.navigateAndWait('/signup');
      
      // Verify signup page loads correctly
      await expect(page).toHaveTitle(/إنشاء حساب جديد/);
      await expect(page.locator('h1')).toContainText('إنشاء حساب جديد');
      
      // Fill registration form
      await helpers.fillForm({
        name: testUser.name,
        phone: testUser.phone,
        email: testUser.email!,
        studentId: testUser.studentId!,
        parentPhone: testUser.parentPhone!,
        password: testUser.password
      });
      
      // Submit form and wait for success
      await helpers.submitFormAndWait('button[type="submit"]');
      
      // Should redirect to login page with success message
      await expect(page).toHaveURL('/login');
      
      // Take screenshot for verification
      await helpers.takeScreenshot('registration-success');
    });

    test('should register with minimal required fields only', async ({ page }) => {
      const testUser = TestHelpers.generateTestUser();
      
      await helpers.navigateAndWait('/signup');
      
      // Fill only required fields
      await helpers.fillForm({
        name: testUser.name,
        phone: testUser.phone,
        password: testUser.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/login');
    });

    test('should show validation errors for invalid data', async ({ page }) => {
      await helpers.navigateAndWait('/signup');
      
      // Try to submit with empty fields
      await page.click('button[type="submit"]');
      
      // Check for validation messages
      await expect(page.locator('input[name="name"]:invalid')).toBeVisible();
      await expect(page.locator('input[name="phone"]:invalid')).toBeVisible();
      await expect(page.locator('input[name="password"]:invalid')).toBeVisible();
    });

    test('should prevent registration with existing phone number', async ({ page }) => {
      await helpers.navigateAndWait('/signup');
      
      // Try to register with existing phone
      await helpers.fillForm({
        name: 'Test User',
        phone: TEST_USERS.STUDENT.phone,
        password: 'TestPassword123!'
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toContainText(/رقم الهاتف مستخدم/);
    });
  });

  test.describe('Student Auth - Login Process', () => {
    test('should successfully login with phone number', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Verify login page
      await expect(page).toHaveTitle(/تسجيل الدخول/);
      await expect(page.locator('h1')).toContainText('مرحباً بعودتك');
      
      // Login with phone
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      
      // Should redirect to student dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1')).toContainText('لوحة تحكم الطالب');
      
      await helpers.takeScreenshot('login-success-dashboard');
    });

    test('should successfully login with student ID', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Login with student ID
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.studentId!,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      await helpers.fillForm({
        login: 'invalid_phone',
        password: 'wrong_password'
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toContainText(ERROR_MESSAGES.INVALID_LOGIN);
    });

    test('should toggle password visibility', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      const passwordInput = page.locator('input[name="password"]');
      const toggleButton = page.locator('button[type="button"]').last();
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle to show password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Click again to hide password
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      // First login
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access login page while authenticated
      await helpers.navigateAndWait('/login');
      await expect(page).toHaveURL('/dashboard');
      
      // Try to access signup page while authenticated
      await helpers.navigateAndWait('/signup');
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Student Auth - Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Refresh page
      await page.reload();
      await helpers.waitForLoadingComplete();
      
      // Should still be authenticated
      await expect(page).toHaveURL('/dashboard');
      expect(await helpers.isAuthenticated()).toBe(true);
    });

    test('should logout successfully', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Click user menu and logout
      await helpers.waitAndClick('[data-testid="user-menu"]');
      await helpers.waitAndClick('[data-testid="logout-button"]');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
      expect(await helpers.isAuthenticated()).toBe(false);
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Try to access protected route without authentication
      await helpers.navigateAndWait('/dashboard');
      await expect(page).toHaveURL(/\/login/);
      
      await helpers.navigateAndWait('/profile');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Student Auth - Role-based Access', () => {
    test('should redirect student to correct dashboard', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      await expect(page).toHaveURL('/dashboard');
      
      // Verify student-specific content
      await expect(page.locator('h1')).toContainText('لوحة تحكم الطالب');
    });

    test('should prevent access to admin routes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access admin route
      await helpers.navigateAndWait('/admin');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back
    });

    test('should prevent access to professor routes', async ({ page }) => {
      await helpers.login(TEST_USERS.STUDENT);
      
      // Try to access professor route
      await helpers.navigateAndWait('/professor');
      await expect(page).toHaveURL('/dashboard'); // Should redirect back
    });
  });

  test.describe('Student Auth - Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/auth/**', route => route.abort());
      
      await helpers.navigateAndWait('/login');
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await page.click('button[type="submit"]');
      
      // Should show appropriate error message
      await expect(page.locator('.text-destructive-foreground')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Simulate server error
      await page.route('**/api/auth/**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await helpers.navigateAndWait('/login');
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('.text-destructive-foreground')).toBeVisible();
    });
  });

  test.describe('Student Auth - Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Tab through form elements
      await page.keyboard.press('Tab'); // Focus on login input
      await expect(page.locator('input[name="login"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Focus on password input
      await expect(page.locator('input[name="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Focus on toggle button
      await page.keyboard.press('Tab'); // Focus on submit button
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.navigateAndWait('/login');
      
      // Check for proper labels
      await expect(page.locator('label[for="login"]')).toBeVisible();
      await expect(page.locator('label[for="password"]')).toBeVisible();
      
      // Check input associations
      await expect(page.locator('input[name="login"]')).toHaveAttribute('id', 'login');
      await expect(page.locator('input[name="password"]')).toHaveAttribute('id', 'password');
    });
  });

  test.describe('Student Auth - Mobile Responsiveness', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      await helpers.navigateAndWait('/login');
      
      // Verify mobile layout
      await expect(page.locator('.card')).toBeVisible();
      
      // Test form interaction on mobile
      await helpers.fillForm({
        login: TEST_USERS.STUDENT.phone,
        password: TEST_USERS.STUDENT.password
      });
      
      await helpers.submitFormAndWait('button[type="submit"]');
      await expect(page).toHaveURL('/dashboard');
      
      await helpers.takeScreenshot('mobile-login-success');
    });
  });
});