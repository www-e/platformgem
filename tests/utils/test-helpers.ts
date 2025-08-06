import { Page, expect } from '@playwright/test';
import { faker } from 'faker';

export interface TestUser {
  name: string;
  phone: string;
  email?: string;
  password: string;
  studentId?: string;
  parentPhone?: string;
}

export interface TestCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  professorId: string;
}

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Generate a test user with realistic Arabic data
   */
  static generateTestUser(): TestUser {
    const arabicNames = [
      'أحمد محمد علي',
      'فاطمة أحمد حسن',
      'محمد عبدالله سالم',
      'عائشة محمود إبراهيم',
      'عمر خالد يوسف',
      'زينب علي محمد',
      'يوسف أحمد عبدالرحمن',
      'مريم حسن علي'
    ];

    return {
      name: faker.helpers.arrayElement(arabicNames),
      phone: `010${faker.datatype.number({ min: 10000000, max: 99999999 })}`,
      email: faker.internet.email(),
      password: 'TestPassword123!',
      studentId: faker.datatype.number({ min: 100000, max: 999999 }).toString(),
      parentPhone: `011${faker.datatype.number({ min: 10000000, max: 99999999 })}`
    };
  }

  /**
   * Navigate to a page and wait for it to load
   */
  async navigateAndWait(url: string, waitForSelector?: string) {
    await this.page.goto(url);
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector);
    }
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill form fields with data
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`[name="${field}"]`, value);
    }
  }

  /**
   * Wait for navigation after form submission
   */
  async submitFormAndWait(submitSelector: string, expectedUrl?: string) {
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click(submitSelector)
    ]);
    
    if (expectedUrl) {
      await expect(this.page).toHaveURL(new RegExp(expectedUrl));
    }
  }

  /**
   * Check if user is authenticated by looking for dashboard elements
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Login with test credentials
   */
  async login(user: TestUser) {
    await this.navigateAndWait('/login');
    
    await this.fillForm({
      login: user.phone,
      password: user.password
    });

    await this.submitFormAndWait('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL(/\/(dashboard|admin|professor)/);
  }

  /**
   * Register a new test user
   */
  async register(user: TestUser) {
    await this.navigateAndWait('/signup');
    
    const formData: Record<string, string> = {
      name: user.name,
      phone: user.phone,
      password: user.password
    };

    if (user.email) formData.email = user.email;
    if (user.studentId) formData.studentId = user.studentId;
    if (user.parentPhone) formData.parentPhone = user.parentPhone;

    await this.fillForm(formData);
    await this.submitFormAndWait('button[type="submit"]');
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('/login');
  }

  /**
   * Wait for element to be visible and clickable
   */
  async waitAndClick(selector: string, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
    await this.page.click(selector);
  }

  /**
   * Scroll element into view and click
   */
  async scrollAndClick(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.click(selector);
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async checkConsoleErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout = 30000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        if (typeof urlPattern === 'string') {
          return url.includes(urlPattern);
        }
        return urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * Check if element contains text
   */
  async elementContainsText(selector: string, text: string): Promise<boolean> {
    try {
      const element = await this.page.locator(selector);
      const content = await element.textContent();
      return content?.includes(text) || false;
    } catch {
      return false;
    }
  }

  /**
   * Get element text content
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.page.locator(selector);
    return await element.textContent() || '';
  }

  /**
   * Check if page has specific title
   */
  async hasPageTitle(title: string): Promise<boolean> {
    const pageTitle = await this.page.title();
    return pageTitle.includes(title);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    // Wait for any loading spinners to disappear
    await this.page.waitForSelector('[data-testid="loading"]', { state: 'hidden', timeout: 30000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Simulate mobile viewport
   */
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  /**
   * Simulate desktop viewport
   */
  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }
}