#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find files
function findFiles(dir, extensions, results = []) {
  if (!fs.existsSync(dir)) return results;
  
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
        findFiles(filePath, extensions, results);
      }
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(filePath);
      }
    }
  }
  
  return results;
}

// Function to check if file contains payment-related content
function isPaymentRelated(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const paymentKeywords = [
      'payment', 'paymob', 'Payment', 'PayMob', 'PAYMENT', 'PAYMOB',
      'billing', 'transaction', 'checkout', 'wallet', 'credit-card',
      'e-wallet', 'intention', 'iframe', 'webhook', 'merchant'
    ];
    
    return paymentKeywords.some(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

// Function to generate report
function generateReport(files, outputFile, fileType) {
  let report = '';
  
  // Header
  report += `# Payment System Files Report - ${fileType.toUpperCase()} Files\n`;
  report += `Generated on: ${new Date().toISOString()}\n`;
  report += `Total files found: ${files.length}\n\n`;
  
  // Table of Contents
  report += `## Table of Contents\n\n`;
  files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file);
    report += `${index + 1}. [${relativePath}](#${index + 1}-${relativePath.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()})\n`;
  });
  report += `\n`;
  
  // File Contents
  files.forEach((file, index) => {
    const relativePath = path.relative(process.cwd(), file);
    const fileName = path.basename(file);
    
    report += `## ${index + 1}. ${relativePath}\n\n`;
    report += `**File Type:** ${fileType}\n`;
    report += `**File Name:** ${fileName}\n`;
    report += `**Full Path:** ${relativePath}\n\n`;
    
    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      
      report += `**File Size:** ${content.length} characters, ${lines.length} lines\n\n`;
      
      // Add file content with line numbers
      report += `### Content:\n\n`;
      report += `\`\`\`${fileType === 'TypeScript' ? 'typescript' : 'tsx'}\n`;
      
      lines.forEach((line, lineIndex) => {
        const lineNumber = (lineIndex + 1).toString().padStart(4, ' ');
        report += `${lineNumber} | ${line}\n`;
      });
      
      report += `\`\`\`\n\n`;
      
      // Add separator
      report += `${'='.repeat(80)}\n\n`;
      
    } catch (error) {
      report += `**Error reading file:** ${error.message}\n\n`;
    }
  });
  
  // Summary
  report += `## Summary\n\n`;
  report += `- **Total ${fileType} files:** ${files.length}\n`;
  report += `- **Report generated:** ${new Date().toLocaleString()}\n`;
  report += `- **File types included:** ${fileType === 'TypeScript' ? '.ts files' : '.tsx files'}\n\n`;
  
  // File categories
  const categories = {
    'API Routes': files.filter(f => f.includes('/api/')),
    'Services': files.filter(f => f.includes('/lib/') && !f.includes('/api/')),
    'Components': files.filter(f => f.includes('/components/')),
    'Hooks': files.filter(f => f.includes('/hooks/')),
    'Utils': files.filter(f => f.includes('/utils/') || f.includes('util')),
    'Types': files.filter(f => f.includes('types') || f.includes('interface')),
    'Other': files.filter(f => !f.includes('/api/') && !f.includes('/lib/') && !f.includes('/components/') && !f.includes('/hooks/') && !f.includes('/utils/'))
  };
  
  report += `### File Categories:\n\n`;
  Object.entries(categories).forEach(([category, categoryFiles]) => {
    if (categoryFiles.length > 0) {
      report += `**${category}:** ${categoryFiles.length} files\n`;
      categoryFiles.forEach(file => {
        const relativePath = path.relative(process.cwd(), file);
        report += `  - ${relativePath}\n`;
      });
      report += `\n`;
    }
  });
  
  // Write report to file
  fs.writeFileSync(outputFile, report, 'utf8');
  console.log(`✅ ${fileType} report generated: ${outputFile}`);
  console.log(`📊 Total files processed: ${files.length}`);
}

// Main execution
function main() {
  console.log('🔍 Searching for payment-related files...\n');
  
  // Find all TypeScript files
  const tsFiles = findFiles('.', ['.ts'])
    .filter(file => !file.includes('node_modules'))
    .filter(file => !file.includes('.d.ts'))
    .filter(isPaymentRelated)
    .sort();
  
  // Find all TSX files
  const tsxFiles = findFiles('.', ['.tsx'])
    .filter(file => !file.includes('node_modules'))
    .filter(isPaymentRelated)
    .sort();
  
  console.log(`📁 Found ${tsFiles.length} TypeScript (.ts) files`);
  console.log(`📁 Found ${tsxFiles.length} TSX (.tsx) files\n`);
  
  // Generate reports
  if (tsFiles.length > 0) {
    generateReport(tsFiles, 'paymentreport.txt', 'TypeScript');
  }
  
  if (tsxFiles.length > 0) {
    generateReport(tsxFiles, 'paymentreport-tsx.txt', 'TSX');
  }
  
  console.log('\n✨ Payment reports generated successfully!');
  console.log('📄 TypeScript files report: paymentreport.txt');
  console.log('📄 TSX files report: paymentreport-tsx.txt');
}

// Run the script
main();