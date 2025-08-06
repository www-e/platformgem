import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS, TEST_COURSES, SEARCH_TERMS, FILTER_OPTIONS } from '../utils/test-data';

test.describe('Student Journey - Course Discovery', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('Student Courses - Course Catalog Navigation', () => {
    test('should display course catalog with all courses', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      
      // Verify page title and header
      await expect(page).toHaveTitle(/تصفح الدورات التعليمية/);
      await expect(page.locator('h1')).toContainText('تصفح الدورات التعليمية');
      
      // Wait for courses to load
      await helpers.waitForLoadingComplete();
      
      // Verify course cards are displayed
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
      
      // Verify course information is displayed
      await expect(courseCards.first().locator('.course-title')).toBeVisible();
      await expect(courseCards.first().locator('.course-price')).toBeVisible();
      await expect(courseCards.first().locator('.course-category')).toBeVisible();
      
      await helpers.takeScreenshot('course-catalog-loaded');
    });

    test('should navigate between course catalog pages', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]');
      if (await pagination.isVisible()) {
        // Click next page
        await helpers.waitAndClick('[data-testid="next-page"]');
        await helpers.waitForLoadingComplete();
        
        // Verify URL changed
        await expect(page).toHaveURL(/page=2/);
        
        // Click previous page
        await helpers.waitAndClick('[data-testid="prev-page"]');
        await helpers.waitForLoadingComplete();
        
        await expect(page).toHaveURL(/page=1|courses$/);
      }
    });

    test('should display course categories correctly', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Verify category filter is available
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await expect(categoryFilter).toBeVisible();
      
      // Check category options
      await categoryFilter.click();
      
      const categoryOptions = page.locator('[data-testid="category-option"]');
      await expect(categoryOptions.first()).toBeVisible();
      
      // Select a category
      await categoryOptions.first().click();
      await helpers.waitForLoadingComplete();
      
      // Verify filtered results
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
    });
  });

  test.describe('Student Courses - Search Functionality', () => {
    test('should search courses by title', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toBeVisible();
      
      // Search for a specific course
      const searchTerm = SEARCH_TERMS[0];
      await searchInput.fill(searchTerm);
      await page.keyboard.press('Enter');
      
      await helpers.waitForLoadingComplete();
      
      // Verify search results
      await expect(page).toHaveURL(new RegExp(`search=${searchTerm}`));
      
      const courseCards = page.locator('[data-testid="course-card"]');
      if (await courseCards.count() > 0) {
        // Verify search term appears in results
        const firstCourseTitle = await courseCards.first().locator('.course-title').textContent();
        expect(firstCourseTitle?.toLowerCase()).toContain(searchTerm.toLowerCase());
      }
      
      await helpers.takeScreenshot('search-results');
    });

    test('should handle empty search results', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill('nonexistentcourse12345');
      await page.keyboard.press('Enter');
      
      await helpers.waitForLoadingComplete();
      
      // Should show no results message
      await expect(page.locator('[data-testid="no-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="no-results"]')).toContainText(/لم يتم العثور على دورات/);
    });

    test('should clear search and show all courses', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const searchInput = page.locator('[data-testid="search-input"]');
      
      // Perform search
      await searchInput.fill(SEARCH_TERMS[0]);
      await page.keyboard.press('Enter');
      await helpers.waitForLoadingComplete();
      
      // Clear search
      await searchInput.clear();
      await page.keyboard.press('Enter');
      await helpers.waitForLoadingComplete();
      
      // Should show all courses again
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
    });
  });

  test.describe('Student Courses - Filtering and Sorting', () => {
    test('should filter courses by price range', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const priceFilter = page.locator('[data-testid="price-filter"]');
      await expect(priceFilter).toBeVisible();
      
      // Select free courses
      await priceFilter.click();
      await page.locator('[data-testid="price-option-free"]').click();
      await helpers.waitForLoadingComplete();
      
      // Verify URL contains filter
      await expect(page).toHaveURL(/priceRange=free/);
      
      // Verify filtered results show only free courses
      const courseCards = page.locator('[data-testid="course-card"]');
      if (await courseCards.count() > 0) {
        const priceElements = courseCards.locator('.course-price');
        for (let i = 0; i < await priceElements.count(); i++) {
          const priceText = await priceElements.nth(i).textContent();
          expect(priceText).toContain('مجاني');
        }
      }
    });

    test('should sort courses by different criteria', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const sortSelect = page.locator('[data-testid="sort-select"]');
      await expect(sortSelect).toBeVisible();
      
      // Sort by price (low to high)
      await sortSelect.click();
      await page.locator('[data-testid="sort-option-price-low"]').click();
      await helpers.waitForLoadingComplete();
      
      // Verify URL contains sort parameter
      await expect(page).toHaveURL(/sort=price-low/);
      
      await helpers.takeScreenshot('sorted-courses');
    });

    test('should combine multiple filters', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Apply category filter
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.click();
      await page.locator('[data-testid="category-option"]').first().click();
      await helpers.waitForLoadingComplete();
      
      // Apply price filter
      const priceFilter = page.locator('[data-testid="price-filter"]');
      await priceFilter.click();
      await page.locator('[data-testid="price-option-100-300"]').click();
      await helpers.waitForLoadingComplete();
      
      // Verify URL contains both filters
      await expect(page).toHaveURL(/category=.*&priceRange=100-300|priceRange=100-300.*&category=/);
      
      const courseCards = page.locator('[data-testid="course-card"]');
      if (await courseCards.count() > 0) {
        await expect(courseCards.first()).toBeVisible();
      }
    });

    test('should clear all filters', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Apply some filters
      const categoryFilter = page.locator('[data-testid="category-filter"]');
      await categoryFilter.click();
      await page.locator('[data-testid="category-option"]').first().click();
      await helpers.waitForLoadingComplete();
      
      // Clear filters
      const clearFiltersButton = page.locator('[data-testid="clear-filters"]');
      if (await clearFiltersButton.isVisible()) {
        await clearFiltersButton.click();
        await helpers.waitForLoadingComplete();
        
        // Verify URL is clean
        await expect(page).toHaveURL(/^.*\/courses\/?$/);
      }
    });
  });

  test.describe('Student Courses - Course Details View', () => {
    test('should display course details correctly', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Click on first course
      const firstCourse = page.locator('[data-testid="course-card"]').first();
      await firstCourse.click();
      
      // Should navigate to course details page
      await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+/);
      
      // Verify course details are displayed
      await expect(page.locator('h1')).toBeVisible(); // Course title
      await expect(page.locator('[data-testid="course-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="course-price"]')).toBeVisible();
      await expect(page.locator('[data-testid="course-professor"]')).toBeVisible();
      await expect(page.locator('[data-testid="course-lessons"]')).toBeVisible();
      
      await helpers.takeScreenshot('course-details-page');
    });

    test('should show course statistics', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const firstCourse = page.locator('[data-testid="course-card"]').first();
      await firstCourse.click();
      
      // Verify course statistics
      await expect(page.locator('[data-testid="course-duration"]')).toBeVisible();
      await expect(page.locator('[data-testid="course-students-count"]')).toBeVisible();
      await expect(page.locator('[data-testid="course-lessons-count"]')).toBeVisible();
      
      // Verify rating display
      const rating = page.locator('[data-testid="course-rating"]');
      if (await rating.isVisible()) {
        await expect(rating).toContainText(/\d+\.\d+/); // Should show numeric rating
      }
    });

    test('should display professor information', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const firstCourse = page.locator('[data-testid="course-card"]').first();
      await firstCourse.click();
      
      // Verify professor section
      const professorSection = page.locator('[data-testid="professor-info"]');
      await expect(professorSection).toBeVisible();
      await expect(professorSection.locator('[data-testid="professor-name"]')).toBeVisible();
      
      // Check for professor bio if available
      const professorBio = professorSection.locator('[data-testid="professor-bio"]');
      if (await professorBio.isVisible()) {
        await expect(professorBio).toContainText(/.+/); // Should have some content
      }
    });

    test('should show course curriculum/lessons', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const firstCourse = page.locator('[data-testid="course-card"]').first();
      await firstCourse.click();
      
      // Verify lessons list
      const lessonsList = page.locator('[data-testid="lessons-list"]');
      if (await lessonsList.isVisible()) {
        const lessons = lessonsList.locator('[data-testid="lesson-item"]');
        await expect(lessons.first()).toBeVisible();
        
        // Verify lesson information
        await expect(lessons.first().locator('[data-testid="lesson-title"]')).toBeVisible();
        await expect(lessons.first().locator('[data-testid="lesson-duration"]')).toBeVisible();
      }
    });
  });

  test.describe('Student Courses - Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Verify mobile layout
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
      
      // Test mobile search
      const searchInput = page.locator('[data-testid="search-input"]');
      await searchInput.fill(SEARCH_TERMS[0]);
      await page.keyboard.press('Enter');
      await helpers.waitForLoadingComplete();
      
      await helpers.takeScreenshot('mobile-course-catalog');
    });

    test('should adapt filters for mobile', async ({ page }) => {
      await helpers.setMobileViewport();
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Check if filters are collapsed on mobile
      const filtersToggle = page.locator('[data-testid="filters-toggle"]');
      if (await filtersToggle.isVisible()) {
        await filtersToggle.click();
        
        // Verify filters panel opens
        const filtersPanel = page.locator('[data-testid="filters-panel"]');
        await expect(filtersPanel).toBeVisible();
      }
    });
  });

  test.describe('Student Courses - Performance and Loading', () => {
    test('should load courses efficiently', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Verify courses loaded within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
      
      // Verify course cards are visible
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
    });

    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow network
      await page.route('**/api/courses**', async route => {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        await route.continue();
      });
      
      await helpers.navigateAndWait('/courses');
      
      // Should show loading state
      const loadingIndicator = page.locator('[data-testid="loading"]');
      await expect(loadingIndicator).toBeVisible();
      
      // Wait for content to load
      await helpers.waitForLoadingComplete();
      
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toBeVisible();
    });
  });

  test.describe('Student Courses - Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Simulate API error
      await page.route('**/api/courses**', route => 
        route.fulfill({ status: 500, body: 'Internal Server Error' })
      );
      
      await helpers.navigateAndWait('/courses');
      
      // Should show error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/خطأ في تحميل الدورات/);
    });

    test('should handle network failures', async ({ page }) => {
      // Simulate network failure
      await page.route('**/api/courses**', route => route.abort());
      
      await helpers.navigateAndWait('/courses');
      
      // Should show appropriate error message
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Student Courses - Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // Search input
      await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
      
      await page.keyboard.press('Tab'); // Category filter
      await page.keyboard.press('Tab'); // Price filter
      await page.keyboard.press('Tab'); // Sort select
      await page.keyboard.press('Tab'); // First course card
      
      const firstCourse = page.locator('[data-testid="course-card"]').first();
      await expect(firstCourse).toBeFocused();
      
      // Should be able to activate with Enter
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+/);
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await helpers.navigateAndWait('/courses');
      await helpers.waitForLoadingComplete();
      
      // Check search input has proper label
      const searchInput = page.locator('[data-testid="search-input"]');
      await expect(searchInput).toHaveAttribute('aria-label');
      
      // Check course cards have proper roles
      const courseCards = page.locator('[data-testid="course-card"]');
      await expect(courseCards.first()).toHaveAttribute('role', 'button');
    });
  });
});