// output.cjs
const fs = require('fs');
const path = require('path');

const errorFiles = [
  './src/app/admin/payments/page.tsx',
  './src/app/api/admin/payments/export/route.ts',
  './src/app/api/admin/professors/route.ts',
  './src/app/api/lessons/[id]/analytics/route.ts',
  './src/app/api/payments/initiate/route.ts',
  './src/app/api/payments/webhook/route.ts',
  './src/app/api/professor/dashboard-stats/route.ts',
  './src/app/api/professor/enrollment-stats/route.ts',
  './src/app/api/professor/student-engagement/route.ts',
  './src/app/api/professor/student-enrollments/route.ts',
  './src/app/api/users/route.ts',
  './src/components/admin/analytics/AnalyticsDashboard.tsx',
  './src/components/admin/analytics/InteractiveCharts.tsx',
  './src/components/admin/CategoryManagement.tsx',
  './src/components/admin/ModernFilters.tsx',
  './src/components/admin/student-detail/CertificateList.tsx',
  './src/components/admin/student-detail/EnrollmentList.tsx',
  './src/components/admin/student-detail/PaymentList.tsx',
  './src/components/admin/student-detail/StudentDataTabs.tsx',
  './src/components/course/CourseAccessGuard.tsx',
  './src/components/course/CourseCatalog.tsx',
  './src/components/course/CourseContent.tsx',
  './src/components/course/CourseProgress.tsx',
  './src/components/course/MaterialManager.tsx',
  './src/components/course/StudyScheduler.tsx',
  './src/components/payment/PaymentResult.tsx',
  './src/components/professor/LessonEditor.tsx',
  './src/components/professor/ProfessorCourseManagement.tsx',
  './src/components/profile/ExamHistory.tsx',
  './src/components/ui/mobile-interactions.tsx',
  './src/hooks/useAdminPayments.ts',
  './src/hooks/useAnimations.ts',
  './src/hooks/useCreateCourseForm.ts',
  './src/hooks/useProgressTracking.ts',
  './src/lib/animations.ts',
  './src/lib/api/auth.ts',
  './src/lib/api/courses.ts',
  './src/lib/api/database.ts',
  './src/lib/api/payments.ts',
  './src/lib/api/query-builders.ts',
  './src/lib/api/validation.ts',
  './src/lib/api-response.ts',
  './src/lib/auth-utils.ts',
  './src/lib/certificate.ts',
  './src/lib/course-utils.ts',
  './src/lib/middleware/error-handler.ts',
  './src/lib/paymob/client.ts',
  './src/lib/paymob/mobile-wallet.service.ts',
  './src/lib/paymob/types.ts',
  './src/lib/paymob/utils.ts',
  './src/lib/paymob/webhook.service.ts',
  './src/lib/services/course/index.service.ts',
  './src/lib/services/course-access.service.ts',
  './src/lib/services/course-service.ts',
  './src/lib/services/enrollment/core.service.ts',
  './src/lib/services/enrollment/webhook.service.ts',
  './src/lib/services/logging.service.ts',
  './src/lib/types/course-access.ts',
  './src/lib/webhook-processor.ts',
  './src/types/course.ts',
];

// Helper to safely read file contents
function readFileContent(filePath) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    return fs.readFileSync(absolutePath, { encoding: 'utf8' });
  } catch (err) {
    return `[Error reading file: ${filePath}] - ${err.message}\n`;
  }
}

function generateReportWithContents(files) {
  let report = '';
  report += 'Build Errors Report with File Contents\n';
  report += '======================================\n\n';
  report += `Total files with errors: ${files.length}\n\n`;

  files.forEach((file, idx) => {
    report += `#${idx + 1}: ${file}\n`;
    report += '-'.repeat(80) + '\n';
    const content = readFileContent(file);
    report += content + '\n\n';
  });

  return report;
}

const reportContent = generateReportWithContents(errorFiles);
const outputPath = path.join(process.cwd(), 'output.txt');

fs.writeFileSync(outputPath, reportContent, { encoding: 'utf8' });

console.log(`Detailed error report with full file contents saved to ${outputPath}`);
