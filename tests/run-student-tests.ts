#!/usr/bin/env node

/**
 * Comprehensive Student Journey Test Runner
 * 
 * This script runs all student journey tests and generates detailed reports
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testFile: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

interface TestSuite {
  name: string;
  description: string;
  testFiles: string[];
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
}

class StudentJourneyTestRunner {
  private testSuites: TestSuite[] = [
    {
      name: 'Authentication Flow',
      description: 'Tests for student registration, login, and session management',
      testFiles: ['01-authentication.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Course Discovery',
      description: 'Tests for course catalog browsing, search, and filtering',
      testFiles: ['02-course-discovery.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Course Enrollment',
      description: 'Tests for free and paid course enrollment processes',
      testFiles: ['03-course-enrollment.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Learning Experience',
      description: 'Tests for course content access, video player, and progress tracking',
      testFiles: ['04-learning-experience.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Student Dashboard',
      description: 'Tests for dashboard functionality, statistics, and navigation',
      testFiles: ['05-student-dashboard.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Profile Management',
      description: 'Tests for profile viewing, editing, and course history',
      testFiles: ['06-profile-management.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    },
    {
      name: 'Payment System',
      description: 'Tests for payment history, statistics, and transaction management',
      testFiles: ['07-payment-system.spec.ts'],
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0
    }
  ];

  private reportDir = join(__dirname, 'reports');
  private startTime: number = 0;
  private endTime: number = 0;

  constructor() {
    this.ensureReportDirectory();
  }

  private ensureReportDirectory() {
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Student Journey Tests');
    console.log('=' .repeat(60));
    
    this.startTime = Date.now();

    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }

    this.endTime = Date.now();
    
    await this.generateReports();
    this.printSummary();
  }

  private async runTestSuite(suite: TestSuite) {
    console.log(`\n📋 Running Test Suite: ${suite.name}`);
    console.log(`📝 ${suite.description}`);
    console.log('-'.repeat(50));

    const suiteStartTime = Date.now();

    for (const testFile of suite.testFiles) {
      try {
        console.log(`🧪 Running ${testFile}...`);
        
        const command = `npx playwright test student-journey/${testFile} --reporter=json`;
        const result = execSync(command, { 
          cwd: __dirname,
          encoding: 'utf8',
          timeout: 300000 // 5 minutes timeout
        });

        const testResults = this.parseTestResults(result, testFile);
        suite.results.push(...testResults);
        
        console.log(`✅ ${testFile} completed`);
        
      } catch (error: any) {
        console.log(`❌ ${testFile} failed`);
        
        const failedResult: TestResult = {
          testFile,
          testName: 'Suite Execution',
          status: 'failed',
          duration: 0,
          error: error.message
        };
        
        suite.results.push(failedResult);
      }
    }

    const suiteEndTime = Date.now();
    suite.totalDuration = suiteEndTime - suiteStartTime;
    
    // Calculate suite statistics
    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.status === 'passed').length;
    suite.failedTests = suite.results.filter(r => r.status === 'failed').length;
    suite.skippedTests = suite.results.filter(r => r.status === 'skipped').length;

    console.log(`📊 Suite Results: ${suite.passedTests} passed, ${suite.failedTests} failed, ${suite.skippedTests} skipped`);
    console.log(`⏱️  Duration: ${(suite.totalDuration / 1000).toFixed(2)}s`);
  }

  private parseTestResults(jsonOutput: string, testFile: string): TestResult[] {
    try {
      const data = JSON.parse(jsonOutput);
      const results: TestResult[] = [];

      if (data.suites) {
        for (const suite of data.suites) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              results.push({
                testFile,
                testName: test.title,
                status: test.outcome === 'expected' ? 'passed' : 
                       test.outcome === 'skipped' ? 'skipped' : 'failed',
                duration: test.results?.[0]?.duration || 0,
                error: test.results?.[0]?.error?.message
              });
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.warn(`Warning: Could not parse test results for ${testFile}`);
      return [];
    }
  }

  private async generateReports() {
    console.log('\n📊 Generating Test Reports...');
    
    await this.generateHtmlReport();
    await this.generateJsonReport();
    await this.generateCsvReport();
    await this.generateMarkdownReport();
    
    console.log('✅ Reports generated successfully');
  }

  private async generateHtmlReport() {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = this.testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const totalDuration = this.endTime - this.startTime;

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير اختبارات رحلة الطالب الشاملة</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .suites {
            padding: 30px;
        }
        .suite {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
        }
        .suite-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #e9ecef;
        }
        .suite-title {
            font-size: 1.3em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .suite-description {
            color: #666;
            margin-bottom: 10px;
        }
        .suite-stats {
            display: flex;
            gap: 20px;
            font-size: 0.9em;
        }
        .test-results {
            padding: 20px;
        }
        .test-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #f0f0f0;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-name {
            flex: 1;
        }
        .test-status {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        .test-duration {
            margin-left: 10px;
            color: #666;
            font-size: 0.9em;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        .error-details {
            background: #f8f9fa;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.8em;
            color: #dc3545;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>تقرير اختبارات رحلة الطالب الشاملة</h1>
            <p>تم إنشاؤه في ${new Date().toLocaleString('ar-SA')}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number total">${totalTests}</div>
                <div class="stat-label">إجمالي الاختبارات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${totalPassed}</div>
                <div class="stat-label">اختبارات ناجحة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${totalFailed}</div>
                <div class="stat-label">اختبارات فاشلة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number skipped">${totalSkipped}</div>
                <div class="stat-label">اختبارات متجاهلة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${(totalDuration / 1000 / 60).toFixed(1)}</div>
                <div class="stat-label">دقائق إجمالية</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${((totalPassed / totalTests) * 100).toFixed(1)}%</div>
                <div class="stat-label">معدل النجاح</div>
            </div>
        </div>
        
        <div class="suites">
            ${this.testSuites.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <div class="suite-title">${suite.name}</div>
                        <div class="suite-description">${suite.description}</div>
                        <div class="suite-stats">
                            <span class="passed">✅ ${suite.passedTests} ناجح</span>
                            <span class="failed">❌ ${suite.failedTests} فاشل</span>
                            <span class="skipped">⏭️ ${suite.skippedTests} متجاهل</span>
                            <span>⏱️ ${(suite.totalDuration / 1000).toFixed(2)}ث</span>
                        </div>
                    </div>
                    <div class="test-results">
                        ${suite.results.map(test => `
                            <div class="test-item">
                                <div class="test-name">${test.testName}</div>
                                <div>
                                    <span class="test-duration">${(test.duration / 1000).toFixed(2)}ث</span>
                                    <span class="test-status status-${test.status}">
                                        ${test.status === 'passed' ? 'نجح' : 
                                          test.status === 'failed' ? 'فشل' : 'متجاهل'}
                                    </span>
                                </div>
                            </div>
                            ${test.error ? `<div class="error-details">${test.error}</div>` : ''}
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة نظام اختبار رحلة الطالب الشاملة</p>
            <p>وقت التشغيل الإجمالي: ${(totalDuration / 1000 / 60).toFixed(2)} دقيقة</p>
        </div>
    </div>
</body>
</html>`;

    writeFileSync(join(this.reportDir, 'student-journey-report.html'), html);
  }

  private async generateJsonReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0),
        passedTests: this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0),
        failedTests: this.testSuites.reduce((sum, suite) => sum + suite.failedTests, 0),
        skippedTests: this.testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0),
        totalDuration: this.endTime - this.startTime,
        successRate: (this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0) / 
                     this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)) * 100
      },
      testSuites: this.testSuites
    };

    writeFileSync(join(this.reportDir, 'student-journey-report.json'), JSON.stringify(report, null, 2));
  }

  private async generateCsvReport() {
    const csvRows = ['Test Suite,Test Name,Status,Duration (ms),Error'];
    
    for (const suite of this.testSuites) {
      for (const test of suite.results) {
        csvRows.push([
          suite.name,
          test.testName,
          test.status,
          test.duration.toString(),
          test.error || ''
        ].map(field => `"${field.replace(/"/g, '""')}"`).join(','));
      }
    }

    writeFileSync(join(this.reportDir, 'student-journey-report.csv'), csvRows.join('\n'));
  }

  private async generateMarkdownReport() {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = this.testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const totalDuration = this.endTime - this.startTime;

    const markdown = `# تقرير اختبارات رحلة الطالب الشاملة

**تاريخ التشغيل:** ${new Date().toLocaleString('ar-SA')}

## ملخص النتائج

| المقياس | القيمة |
|---------|--------|
| إجمالي الاختبارات | ${totalTests} |
| الاختبارات الناجحة | ${totalPassed} |
| الاختبارات الفاشلة | ${totalFailed} |
| الاختبارات المتجاهلة | ${totalSkipped} |
| معدل النجاح | ${((totalPassed / totalTests) * 100).toFixed(1)}% |
| الوقت الإجمالي | ${(totalDuration / 1000 / 60).toFixed(2)} دقيقة |

## نتائج مجموعات الاختبار

${this.testSuites.map(suite => `
### ${suite.name}

**الوصف:** ${suite.description}

**الإحصائيات:**
- ✅ ${suite.passedTests} ناجح
- ❌ ${suite.failedTests} فاشل  
- ⏭️ ${suite.skippedTests} متجاهل
- ⏱️ ${(suite.totalDuration / 1000).toFixed(2)} ثانية

**تفاصيل الاختبارات:**

| اسم الاختبار | الحالة | المدة |
|-------------|-------|------|
${suite.results.map(test => 
  `| ${test.testName} | ${test.status === 'passed' ? '✅ نجح' : 
                        test.status === 'failed' ? '❌ فشل' : '⏭️ متجاهل'} | ${(test.duration / 1000).toFixed(2)}ث |`
).join('\n')}

${suite.results.filter(test => test.error).map(test => 
  `**خطأ في ${test.testName}:**\n\`\`\`\n${test.error}\n\`\`\`\n`
).join('\n')}
`).join('\n')}

## التوصيات

${totalFailed > 0 ? `
### الاختبارات الفاشلة
يوجد ${totalFailed} اختبار فاشل يحتاج إلى مراجعة وإصلاح.

` : ''}

${((totalPassed / totalTests) * 100) < 90 ? `
### معدل النجاح
معدل النجاح الحالي ${((totalPassed / totalTests) * 100).toFixed(1)}% أقل من المستوى المطلوب (90%). يُنصح بمراجعة الاختبارات الفاشلة.

` : ''}

### الخطوات التالية
1. مراجعة الاختبارات الفاشلة وإصلاح المشاكل
2. تشغيل الاختبارات مرة أخرى للتأكد من الإصلاحات
3. إضافة اختبارات جديدة حسب الحاجة
4. مراجعة الأداء وتحسين سرعة الاختبارات

---
*تم إنشاء هذا التقرير بواسطة نظام اختبار رحلة الطالب الشاملة*`;

    writeFileSync(join(this.reportDir, 'student-journey-report.md'), markdown);
  }

  private printSummary() {
    const totalTests = this.testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
    const totalSkipped = this.testSuites.reduce((sum, suite) => sum + suite.skippedTests, 0);
    const totalDuration = this.endTime - this.startTime;
    const successRate = (totalPassed / totalTests) * 100;

    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE STUDENT JOURNEY TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`📈 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`⏭️  Skipped: ${totalSkipped}`);
    console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${(totalDuration / 1000 / 60).toFixed(2)} minutes`);
    console.log('='.repeat(60));

    if (totalFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! The student journey is working perfectly!');
    } else {
      console.log(`⚠️  ${totalFailed} tests failed. Please review the detailed report.`);
    }

    console.log(`\n📋 Detailed reports generated in: ${this.reportDir}`);
    console.log('   - student-journey-report.html (Interactive HTML report)');
    console.log('   - student-journey-report.json (Machine-readable data)');
    console.log('   - student-journey-report.csv (Spreadsheet format)');
    console.log('   - student-journey-report.md (Markdown documentation)');
    
    console.log('\n🚀 Test execution completed!');
  }
}

// Run the tests if this script is executed directly
if (require.main === module) {
  const runner = new StudentJourneyTestRunner();
  runner.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { StudentJourneyTestRunner };