const fs = require('fs');
const path = require('path');

// Core payment and enrollment files from our discussion
const coreFiles = [
  // Core Payment Services
  {
    category: "🔥 CORE PAYMENT SERVICES",
    subcategory: "Payment Processing Core",
    files: [
      "src/app/api/payments/initiate/route.ts",
      "src/app/api/payments/webhook/route.ts",
      "src/lib/paymob/client.ts",
      "src/lib/paymob/payment.service.ts",
      "src/lib/paymob/webhook.service.ts"
    ]
  },
  {
    category: "🔥 CORE PAYMENT SERVICES",
    subcategory: "Payment Configuration & Types",
    files: [
      "src/lib/paymob/config.ts",
      "src/lib/paymob/types.ts",
      "src/lib/webhook-processor.ts"
    ]
  },
  // Core Enrollment Services
  {
    category: "📚 CORE ENROLLMENT SERVICES",
    subcategory: "Enrollment Processing Core",
    files: [
      "src/lib/services/enrollment/core.service.ts",
      "src/app/api/courses/[id]/enroll/route.ts",
      "src/app/api/courses/[id]/enroll-enhanced/route.ts",
      "src/lib/services/enrollment/access.service.ts"
    ]
  },
  {
    category: "📚 CORE ENROLLMENT SERVICES",
    subcategory: "Enrollment Webhooks & Processing",
    files: [
      "src/lib/services/enrollment/webhook.service.ts",
      "src/app/api/courses/[id]/enrollment-status/route.ts",
      "src/app/api/courses/[id]/access/route.ts"
    ]
  },
  {
    category: "📚 CORE ENROLLMENT SERVICES",
    subcategory: "Enrollment Data & Queries",
    files: [
      "src/lib/services/enrollment/query.service.ts",
      "src/lib/services/enrollment/types.ts"
    ]
  },
  // Integration Layer
  {
    category: "🔗 INTEGRATION LAYER",
    subcategory: "Course Access Control",
    files: [
      "src/lib/services/course-access.service.ts",
      "src/components/course/CourseAccessGuard.tsx"
    ]
  },
  {
    category: "🔗 INTEGRATION LAYER",
    subcategory: "Free Enrollment",
    files: [
      "src/app/api/courses/[id]/enroll-free/route.ts"
    ]
  }
];

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  } catch (error) {
    return 'File not found';
  }
}

function getLineCount(content) {
  return content.split('\n').length;
}

function generateReport() {
  let report = '';
  let totalFiles = 0;
  let totalLines = 0;
  let processedFiles = 0;
  let missingFiles = [];

  // Header
  report += '═'.repeat(80) + '\n';
  report += '                    PAYMENT & ENROLLMENT SERVICES REPORT\n';
  report += '                           Core System Files\n';
  report += '═'.repeat(80) + '\n';
  report += `Generated on: ${new Date().toLocaleString()}\n`;
  report += `Location: Egypt\n\n`;

  // Process each category
  coreFiles.forEach(categoryGroup => {
    report += '█'.repeat(60) + '\n';
    report += `${categoryGroup.category}\n`;
    report += '█'.repeat(60) + '\n\n';
    
    report += `▼ ${categoryGroup.subcategory}\n`;
    report += '─'.repeat(40) + '\n';

    categoryGroup.files.forEach(filePath => {
      totalFiles++;
      
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = getLineCount(content);
          const size = getFileSize(filePath);
          
          totalLines += lines;
          processedFiles++;

          report += `\n📄 FILE: ${path.basename(filePath)}\n`;
          report += `📂 PATH: ${filePath}\n`;
          report += `📊 STATS: ${lines} lines | ${size}\n`;
          report += '┌' + '─'.repeat(78) + '┐\n';
          report += '│ FILE CONTENT:' + ' '.repeat(65) + '│\n';
          report += '└' + '─'.repeat(78) + '┘\n';
          
          // Add content with line numbers
          const contentLines = content.split('\n');
          contentLines.forEach((line, index) => {
            const lineNum = (index + 1).toString().padStart(4, ' ');
            report += `${lineNum} │ ${line}\n`;
          });
          
          report += '\n' + '▲'.repeat(80) + '\n';
          report += `END OF FILE: ${path.basename(filePath)}\n`;
          report += '▲'.repeat(80) + '\n\n';

        } else {
          missingFiles.push(filePath);
          report += `\n❌ MISSING FILE: ${filePath}\n`;
          report += '   This file was not found in the project structure.\n\n';
        }
      } catch (error) {
        report += `\n❌ ERROR READING FILE: ${filePath}\n`;
        report += `   Error: ${error.message}\n\n`;
      }
    });
    
    report += '\n';
  });

  // Summary Section
  report += '═'.repeat(80) + '\n';
  report += '                              SUMMARY REPORT\n';
  report += '═'.repeat(80) + '\n';
  report += `📊 Total Files Analyzed: ${totalFiles}\n`;
  report += `✅ Successfully Processed: ${processedFiles}\n`;
  report += `❌ Missing Files: ${missingFiles.length}\n`;
  report += `📈 Total Lines of Code: ${totalLines.toLocaleString()}\n`;
  report += `🏗️  Architecture: Payment & Enrollment Core Services\n`;
  report += `🌍 Project Location: Egypt\n\n`;

  if (missingFiles.length > 0) {
    report += 'MISSING FILES LIST:\n';
    report += '─'.repeat(30) + '\n';
    missingFiles.forEach(file => {
      report += `• ${file}\n`;
    });
    report += '\n';
  }

  // Footer
  report += '═'.repeat(80) + '\n';
  report += 'Report generated by Payment & Enrollment Services Analyzer\n';
  report += `Timestamp: ${new Date().toISOString()}\n`;
  report += '═'.repeat(80) + '\n';

  return report;
}

function main() {
  console.log('🚀 Generating Payment & Enrollment Services Report...');
  console.log('📂 Scanning core service files...');
  
  try {
    const report = generateReport();
    const outputPath = path.join(process.cwd(), 'payments.txt');
    
    fs.writeFileSync(outputPath, report, 'utf-8');
    
    console.log('✅ Report generated successfully!');
    console.log(`📄 Report saved to: ${outputPath}`);
    console.log('📊 Report includes:');
    console.log('   • Core payment processing files');
    console.log('   • Enrollment service files');
    console.log('   • Integration layer files');
    console.log('   • Complete file contents with line numbers');
    console.log('   • File statistics and metadata');
    console.log('');
    console.log('🎉 You can now review the payments.txt file for the complete report!');
    
  } catch (error) {
    console.error('❌ Error generating report:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
//to run the script run (node paymentReport.cjs)