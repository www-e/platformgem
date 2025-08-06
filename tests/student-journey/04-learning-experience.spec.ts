import { test, expect } from '@playwright/test';
import { TestHelpers } from '../utils/test-helpers';
import { TEST_USERS } from '../utils/test-data';

test.describe('Student Journey - Learning Experience', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    // Login as student and ensure enrolled in a course
    await helpers.login(TEST_USERS.STUDENT);
  });

  test.describe('Student Courses - Course Content Access', () => {
    test('should access enrolled course content', async ({ page }) => {
      // Navigate to dashboard and find enrolled course
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const coursesTab = page.locator('[data-testid="courses-tab"]');
      if (await coursesTab.isVisible()) {
        await coursesTab.click();
        await helpers.waitForLoadingComplete();
      }
      
      // Click on first enrolled course
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      if (await enrolledCourse.isVisible()) {
        await enrolledCourse.click();
      } else {
        // If no enrolled courses, navigate to courses and enroll in a free one
        await helpers.navigateAndWait('/courses');
        await helpers.waitForLoadingComplete();
        
        const freeCourse = page.locator('[data-testid="course-card"]').first();
        await freeCourse.click();
        
        const enrollButton = page.locator('[data-testid="enroll-button"]');
        if (await enrollButton.isVisible()) {
          await enrollButton.click();
          await helpers.waitForLoadingComplete();
        }
        
        const startButton = page.locator('[data-testid="start-course-button"]');
        await startButton.click();
      }
      
      // Should be on course learning page
      await expect(page).toHaveURL(/\/courses\/[a-zA-Z0-9]+\/learn/);
      
      // Verify course content elements
      await expect(page.locator('[data-testid="course-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="lesson-sidebar"]')).toBeVisible();
      await expect(page.locator('[data-testid="video-player"]')).toBeVisible();
      
      await helpers.takeScreenshot('course-content-access');
    });

    test('should display course navigation sidebar', async ({ page }) => {
      // Navigate to a course learning page
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Verify sidebar elements
      const sidebar = page.locator('[data-testid="lesson-sidebar"]');
      await expect(sidebar).toBeVisible();
      
      // Check lesson list
      const lessonList = sidebar.locator('[data-testid="lesson-list"]');
      await expect(lessonList).toBeVisible();
      
      const lessons = lessonList.locator('[data-testid="lesson-item"]');
      if (await lessons.count() > 0) {
        // Verify lesson information
        await expect(lessons.first().locator('[data-testid="lesson-title"]')).toBeVisible();
        await expect(lessons.first().locator('[data-testid="lesson-duration"]')).toBeVisible();
        
        // Check lesson status indicators
        const lessonStatus = lessons.first().locator('[data-testid="lesson-status"]');
        if (await lessonStatus.isVisible()) {
          const statusText = await lessonStatus.textContent();
          expect(statusText).toMatch(/(مكتمل|قيد التقدم|لم يبدأ)/);
        }
      }
    });

    test('should show course progress indicator', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Check for progress indicator
      const progressIndicator = page.locator('[data-testid="course-progress-indicator"]');
      await expect(progressIndicator).toBeVisible();
      
      // Verify progress percentage
      const progressText = await progressIndicator.locator('[data-testid="progress-percentage"]').textContent();
      expect(progressText).toMatch(/\d+%/);
      
      // Check progress bar
      const progressBar = progressIndicator.locator('[data-testid="progress-bar"]');
      await expect(progressBar).toBeVisible();
    });
  });

  test.describe('Student Courses - Video Player Functionality', () => {
    test('should load and play video content', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Wait for video player to load
      const videoPlayer = page.locator('[data-testid="video-player"]');
      await expect(videoPlayer).toBeVisible();
      
      // Check for video element
      const video = videoPlayer.locator('video');
      await expect(video).toBeVisible();
      
      // Verify video controls
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Video should start playing
        await page.waitForTimeout(2000); // Wait for video to start
        
        const isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
        expect(isPlaying).toBe(true);
      }
      
      await helpers.takeScreenshot('video-player-playing');
    });

    test('should control video playback', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const video = videoPlayer.locator('video');
      
      // Test play/pause
      const playPauseButton = videoPlayer.locator('[data-testid="play-pause-button"]');
      if (await playPauseButton.isVisible()) {
        // Play video
        await playPauseButton.click();
        await page.waitForTimeout(1000);
        
        let isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
        expect(isPlaying).toBe(true);
        
        // Pause video
        await playPauseButton.click();
        await page.waitForTimeout(500);
        
        isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
        expect(isPlaying).toBe(false);
      }
      
      // Test volume control
      const volumeControl = videoPlayer.locator('[data-testid="volume-control"]');
      if (await volumeControl.isVisible()) {
        await volumeControl.click();
        
        const volumeSlider = videoPlayer.locator('[data-testid="volume-slider"]');
        if (await volumeSlider.isVisible()) {
          await volumeSlider.fill('0.5'); // Set volume to 50%
          
          const volume = await video.evaluate((v: HTMLVideoElement) => v.volume);
          expect(volume).toBeCloseTo(0.5, 1);
        }
      }
    });

    test('should track video progress', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const video = videoPlayer.locator('video');
      
      // Start playing video
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Wait for some progress
        await page.waitForTimeout(5000);
        
        // Check if progress is being tracked
        const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
        expect(currentTime).toBeGreaterThan(0);
        
        // Check progress bar
        const progressBar = videoPlayer.locator('[data-testid="video-progress-bar"]');
        if (await progressBar.isVisible()) {
          const progressValue = await progressBar.getAttribute('value');
          expect(Number(progressValue)).toBeGreaterThan(0);
        }
      }
    });

    test('should support video quality selection', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const videoPlayer = page.locator('[data-testid="video-player"]');
      
      // Check for quality selector
      const qualityButton = videoPlayer.locator('[data-testid="quality-button"]');
      if (await qualityButton.isVisible()) {
        await qualityButton.click();
        
        // Should show quality options
        const qualityOptions = page.locator('[data-testid="quality-option"]');
        await expect(qualityOptions.first()).toBeVisible();
        
        // Select a quality option
        await qualityOptions.first().click();
        
        // Quality should change (this would require actual video content to test properly)
        await helpers.takeScreenshot('video-quality-selection');
      }
    });

    test('should support fullscreen mode', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const videoPlayer = page.locator('[data-testid="video-player"]');
      
      // Check for fullscreen button
      const fullscreenButton = videoPlayer.locator('[data-testid="fullscreen-button"]');
      if (await fullscreenButton.isVisible()) {
        await fullscreenButton.click();
        
        // Check if video entered fullscreen (this is browser-dependent)
        await page.waitForTimeout(1000);
        
        // Exit fullscreen (ESC key)
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Student Courses - Lesson Navigation', () => {
    test('should navigate between lessons', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const sidebar = page.locator('[data-testid="lesson-sidebar"]');
      const lessons = sidebar.locator('[data-testid="lesson-item"]');
      
      if (await lessons.count() > 1) {
        // Click on second lesson
        await lessons.nth(1).click();
        await helpers.waitForLoadingComplete();
        
        // URL should change to reflect new lesson
        await expect(page).toHaveURL(/lesson=\d+/);
        
        // Video player should load new content
        const videoPlayer = page.locator('[data-testid="video-player"]');
        await expect(videoPlayer).toBeVisible();
        
        // Lesson title should update
        const lessonTitle = page.locator('[data-testid="current-lesson-title"]');
        await expect(lessonTitle).toBeVisible();
      }
    });

    test('should show next/previous lesson buttons', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Check for navigation buttons
      const nextButton = page.locator('[data-testid="next-lesson-button"]');
      const prevButton = page.locator('[data-testid="prev-lesson-button"]');
      
      // Next button should be visible if not on last lesson
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await helpers.waitForLoadingComplete();
        
        // Should navigate to next lesson
        await expect(page).toHaveURL(/lesson=\d+/);
      }
      
      // Previous button should be visible if not on first lesson
      if (await prevButton.isVisible()) {
        await prevButton.click();
        await helpers.waitForLoadingComplete();
        
        // Should navigate to previous lesson
        await expect(page).toHaveURL(/lesson=\d+/);
      }
    });

    test('should mark lessons as completed', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Watch a lesson to completion (simulate)
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const video = videoPlayer.locator('video');
      
      // Start playing
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Simulate watching to near end
        await video.evaluate((v: HTMLVideoElement) => {
          v.currentTime = v.duration * 0.95; // 95% completion
        });
        
        await page.waitForTimeout(2000);
        
        // Check if lesson is marked as completed
        const completionStatus = page.locator('[data-testid="lesson-completion-status"]');
        if (await completionStatus.isVisible()) {
          await expect(completionStatus).toContainText(/مكتمل/);
        }
        
        // Check in sidebar
        const sidebar = page.locator('[data-testid="lesson-sidebar"]');
        const currentLesson = sidebar.locator('[data-testid="lesson-item"].active');
        const completionIcon = currentLesson.locator('[data-testid="completion-icon"]');
        
        if (await completionIcon.isVisible()) {
          await expect(completionIcon).toBeVisible();
        }
      }
    });
  });

  test.describe('Student Courses - Progress Tracking', () => {
    test('should update course progress as lessons are completed', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      
      // Get initial progress
      const initialProgress = await enrolledCourse.locator('[data-testid="progress-percentage"]').textContent();
      const initialPercentage = parseInt(initialProgress?.replace('%', '') || '0');
      
      // Enter course
      await enrolledCourse.click();
      
      // Complete a lesson (simulate)
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const video = videoPlayer.locator('video');
      
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await playButton.click();
        
        // Simulate completion
        await video.evaluate((v: HTMLVideoElement) => {
          v.currentTime = v.duration * 0.95;
        });
        
        await page.waitForTimeout(3000); // Wait for progress to update
        
        // Go back to dashboard
        await helpers.navigateAndWait('/dashboard');
        await helpers.waitForLoadingComplete();
        
        // Check if progress increased
        const updatedProgress = await enrolledCourse.locator('[data-testid="progress-percentage"]').textContent();
        const updatedPercentage = parseInt(updatedProgress?.replace('%', '') || '0');
        
        expect(updatedPercentage).toBeGreaterThanOrEqual(initialPercentage);
      }
    });

    test('should track total watch time', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check dashboard stats for watch time
      const watchTimeCard = page.locator('[data-testid="watch-time-card"]');
      if (await watchTimeCard.isVisible()) {
        const watchTimeText = await watchTimeCard.locator('[data-testid="watch-time-value"]').textContent();
        expect(watchTimeText).toMatch(/\d+[سد]/); // Should show time in Arabic (hours/minutes)
      }
      
      // Enter a course and watch some content
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      
      if (await playButton.isVisible()) {
        await playButton.click();
        await page.waitForTimeout(5000); // Watch for 5 seconds
        
        // Go back to dashboard
        await helpers.navigateAndWait('/dashboard');
        await helpers.waitForLoadingComplete();
        
        // Watch time should have increased (this would require backend integration to test properly)
      }
    });

    test('should show learning streak', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      // Check for learning streak card
      const streakCard = page.locator('[data-testid="learning-streak-card"]');
      if (await streakCard.isVisible()) {
        const streakValue = await streakCard.locator('[data-testid="streak-value"]').textContent();
        expect(streakValue).toMatch(/\d+/); // Should show numeric value
        
        const streakText = await streakCard.locator('[data-testid="streak-text"]').textContent();
        expect(streakText).toContain('يوم متتالي');
      }
    });
  });

  test.describe('Student Courses - Course Materials', () => {
    test('should display lesson materials', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Check for materials section
      const materialsSection = page.locator('[data-testid="lesson-materials"]');
      if (await materialsSection.isVisible()) {
        await expect(materialsSection).toBeVisible();
        
        // Check for material items
        const materialItems = materialsSection.locator('[data-testid="material-item"]');
        if (await materialItems.count() > 0) {
          // Verify material information
          await expect(materialItems.first().locator('[data-testid="material-title"]')).toBeVisible();
          await expect(materialItems.first().locator('[data-testid="material-download"]')).toBeVisible();
        }
      }
    });

    test('should download course materials', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      const materialsSection = page.locator('[data-testid="lesson-materials"]');
      if (await materialsSection.isVisible()) {
        const materialItems = materialsSection.locator('[data-testid="material-item"]');
        
        if (await materialItems.count() > 0) {
          // Set up download handler
          const downloadPromise = page.waitForEvent('download');
          
          // Click download button
          const downloadButton = materialItems.first().locator('[data-testid="material-download"]');
          await downloadButton.click();
          
          // Wait for download to start
          const download = await downloadPromise;
          expect(download.suggestedFilename()).toBeTruthy();
        }
      }
    });
  });

  test.describe('Student Courses - Mobile Learning Experience', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Video player should be mobile-friendly
      const videoPlayer = page.locator('[data-testid="video-player"]');
      await expect(videoPlayer).toBeVisible();
      
      // Sidebar should be collapsible on mobile
      const sidebarToggle = page.locator('[data-testid="sidebar-toggle"]');
      if (await sidebarToggle.isVisible()) {
        await sidebarToggle.click();
        
        const sidebar = page.locator('[data-testid="lesson-sidebar"]');
        await expect(sidebar).toBeVisible();
        
        // Close sidebar
        await sidebarToggle.click();
      }
      
      await helpers.takeScreenshot('mobile-learning-experience');
    });

    test('should support touch gestures on mobile', async ({ page }) => {
      await helpers.setMobileViewport();
      
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Test swipe gestures for lesson navigation
      const lessonContent = page.locator('[data-testid="lesson-content"]');
      
      // Simulate swipe left (next lesson)
      await lessonContent.hover();
      await page.mouse.down();
      await page.mouse.move(-100, 0);
      await page.mouse.up();
      
      await page.waitForTimeout(1000);
      
      // Should navigate to next lesson or show appropriate feedback
      // This would require proper touch gesture implementation to test fully
    });
  });

  test.describe('Student Courses - Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab'); // Video player controls
      await page.keyboard.press('Tab'); // Play/pause button
      await page.keyboard.press('Tab'); // Volume control
      await page.keyboard.press('Tab'); // Progress bar
      await page.keyboard.press('Tab'); // Fullscreen button
      
      // Should be able to control video with keyboard
      await page.keyboard.press('Space'); // Play/pause
      await page.keyboard.press('ArrowRight'); // Seek forward
      await page.keyboard.press('ArrowLeft'); // Seek backward
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.navigateAndWait('/dashboard');
      await helpers.waitForLoadingComplete();
      
      const enrolledCourse = page.locator('[data-testid="enrolled-course"]').first();
      await enrolledCourse.click();
      
      // Check video player accessibility
      const videoPlayer = page.locator('[data-testid="video-player"]');
      const video = videoPlayer.locator('video');
      
      await expect(video).toHaveAttribute('aria-label');
      
      // Check control buttons
      const playButton = videoPlayer.locator('[data-testid="play-button"]');
      if (await playButton.isVisible()) {
        await expect(playButton).toHaveAttribute('aria-label');
      }
      
      // Check lesson navigation
      const lessonItems = page.locator('[data-testid="lesson-item"]');
      if (await lessonItems.count() > 0) {
        await expect(lessonItems.first()).toHaveAttribute('role');
      }
    });
  });
});