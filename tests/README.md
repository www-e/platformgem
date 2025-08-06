# Comprehensive Student Journey Testing Framework

This directory contains a complete end-to-end testing suite for the student journey in the e-learning platform. The tests are designed to thoroughly validate every aspect of the student experience from registration to course completion.

## 🎯 Overview

The testing framework covers the complete student journey:

1. **Authentication Flow** - Registration, login, session management
2. **Course Discovery** - Browsing, searching, filtering courses
3. **Course Enrollment** - Free and paid course enrollment processes
4. **Learning Experience** - Video player, progress tracking, content access
5. **Student Dashboard** - Statistics, navigation, course management
6. **Profile Management** - Profile viewing, editing, course history
7. **Payment System** - Payment history, transaction management

## 📁 Project Structure

```
tests/
├── student-journey/           # Main test files
│   ├── 01-authentication.spec.ts
│   ├── 02-course-discovery.spec.ts
│   ├── 03-course-enrollment.spec.ts
│   ├── 04-learning-experience.spec.ts
│   ├── 05-student-dashboard.spec.ts
│   ├── 06-profile-management.spec.ts
│   └── 07-payment-system.spec.ts
├── utils/                     # Testing utilities
│   ├── test-helpers.ts       # Helper functions and classes
│   └── test-data.ts          # Test data and constants
├── fixtures/                  # Test data generation
│   └── test-data-generator.ts # Realistic test data generator
├── reports/                   # Generated test reports
├── run-student-tests.ts      # Comprehensive test runner
├── playwright.config.ts      # Playwright configuration
└── package.json              # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

1. Node.js (v16 or higher)
2. The main e-learning platform running locally
3. Test database with sample data

### Installation

```bash
# Navigate to tests directory
cd tests

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

### Running Tests

```bash
# Run all student journey tests
npm run test:student-journey

# Run specific test suites
npm run test:student-auth
npm run test:student-courses
npm run test:student-payments
npm run test:student-dashboard
npm run test:student-profile

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Generate and view test report
npm run test:report
```

### Comprehensive Test Execution

```bash
# Run the comprehensive test runner
npx tsx run-student-tests.ts
```

This will:
- Execute all test suites in sequence
- Generate detailed HTML, JSON, CSV, and Markdown reports
- Provide comprehensive statistics and analysis
- Create screenshots for failed tests
- Generate actionable recommendations

## 📊 Test Coverage

### Authentication Flow (25+ tests)
- ✅ User registration with validation
- ✅ Login with phone/student ID
- ✅ Password visibility toggle
- ✅ Session management
- ✅ Role-based redirects
- ✅ Error handling
- ✅ Mobile responsiveness
- ✅ Accessibility compliance

### Course Discovery (30+ tests)
- ✅ Course catalog display
- ✅ Search functionality
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Sorting options
- ✅ Pagination
- ✅ Course details view
- ✅ Professor information
- ✅ Mobile adaptation
- ✅ Performance optimization

### Course Enrollment (25+ tests)
- ✅ Free course enrollment
- ✅ Paid course enrollment
- ✅ Payment processing
- ✅ Payment validation
- ✅ Enrollment confirmation
- ✅ Duplicate enrollment prevention
- ✅ Payment history recording
- ✅ Error handling
- ✅ Mobile enrollment

### Learning Experience (35+ tests)
- ✅ Course content access
- ✅ Video player functionality
- ✅ Playback controls
- ✅ Progress tracking
- ✅ Lesson navigation
- ✅ Lesson completion
- ✅ Course materials
- ✅ Download functionality
- ✅ Mobile learning
- ✅ Accessibility features

### Student Dashboard (40+ tests)
- ✅ Dashboard overview
- ✅ Statistics display
- ✅ Tab navigation
- ✅ Enrolled courses
- ✅ Progress visualization
- ✅ Payment history
- ✅ Recommended courses
- ✅ Certificates display
- ✅ Recent activity
- ✅ Mobile responsiveness

### Profile Management (30+ tests)
- ✅ Profile information display
- ✅ Course history
- ✅ Certificate management
- ✅ Profile editing
- ✅ Password changes
- ✅ Settings management
- ✅ Quick access features
- ✅ Mobile profile view
- ✅ Error handling

### Payment System (35+ tests)
- ✅ Payment history display
- ✅ Payment statistics
- ✅ Transaction details
- ✅ Payment filtering
- ✅ Monthly analysis
- ✅ Payment methods breakdown
- ✅ Export functionality
- ✅ Mobile payment view
- ✅ Error handling

## 🛠 Test Configuration

### Environment Variables

Create a `.env` file in the tests directory:

```env
TEST_BASE_URL=http://localhost:3000
TEST_TIMEOUT=30000
TEST_RETRIES=2
HEADLESS=true
SLOW_MO=0
```

### Browser Configuration

Tests run on multiple browsers:
- Chromium (Desktop)
- Firefox (Desktop)
- WebKit/Safari (Desktop)
- Mobile Chrome
- Mobile Safari

### Test Data

The framework includes:
- **Static Test Data**: Predefined users, courses, and scenarios
- **Dynamic Test Data**: Generated realistic data using Faker.js
- **Scenario-Specific Data**: Tailored data for specific test scenarios

## 📈 Reporting

The test runner generates multiple report formats:

### HTML Report
Interactive report with:
- Test execution summary
- Detailed results by test suite
- Screenshots of failures
- Performance metrics
- Arabic language support

### JSON Report
Machine-readable format for:
- CI/CD integration
- Custom analysis tools
- Data processing

### CSV Report
Spreadsheet format for:
- Data analysis
- Reporting to stakeholders
- Historical tracking

### Markdown Report
Documentation format for:
- README files
- Wiki documentation
- GitHub integration

## 🔧 Customization

### Adding New Tests

1. Create a new test file in `student-journey/`
2. Follow the existing naming convention
3. Use the `TestHelpers` class for common operations
4. Add test data to `utils/test-data.ts`
5. Update the test runner configuration

### Custom Test Helpers

Extend the `TestHelpers` class:

```typescript
class CustomTestHelpers extends TestHelpers {
  async customOperation() {
    // Your custom test operation
  }
}
```

### Test Data Generation

Use the `TestDataGenerator` for realistic data:

```typescript
import { TestDataGenerator } from '../fixtures/test-data-generator';

const testUser = TestDataGenerator.generateUser('STUDENT');
const testCourse = TestDataGenerator.generateCourse(categoryId, professorId);
```

## 🚨 Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check if the application is running
   - Verify network connectivity

2. **Authentication failures**
   - Ensure test users exist in database
   - Check authentication endpoints
   - Verify session management

3. **Element not found**
   - Check if selectors match the application
   - Verify page loading states
   - Update test data attributes

4. **Payment tests failing**
   - Verify payment gateway configuration
   - Check test payment credentials
   - Ensure payment endpoints are accessible

### Debug Mode

Run tests in debug mode:

```bash
npm run test:debug
```

This will:
- Run tests in headed mode
- Pause on failures
- Allow step-by-step debugging
- Show browser developer tools

## 📋 Best Practices

### Test Writing
- Use descriptive test names in Arabic
- Follow the AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated
- Use page object model for complex interactions
- Add appropriate wait conditions

### Data Management
- Use realistic test data
- Clean up test data after execution
- Avoid hardcoded values
- Use environment-specific configurations

### Error Handling
- Test both success and failure scenarios
- Verify error messages are user-friendly
- Check error recovery mechanisms
- Test network failure scenarios

### Performance
- Monitor test execution time
- Optimize slow tests
- Use parallel execution when possible
- Implement proper cleanup

## 🤝 Contributing

1. Follow the existing code structure
2. Add comprehensive test coverage
3. Update documentation
4. Test on multiple browsers
5. Ensure Arabic language support

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review existing test patterns
3. Consult the test helpers documentation
4. Create detailed bug reports with screenshots

---

**Note**: This testing framework is designed to ensure the highest quality student experience. Regular execution of these tests helps maintain platform reliability and user satisfaction.