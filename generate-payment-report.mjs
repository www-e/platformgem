#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = 'paymentissueoutput.txt';

// List of files to analyze
const FILES_TO_ANALYZE = [
  // Core PayMob Integration Files
  'src/lib/paymob/mobile-wallet.service.ts',
  'src/lib/paymob/payment.service.ts',
  'src/lib/paymob/client.ts',
  'src/lib/paymob/config.ts',
  'src/lib/paymob/types.ts',
  'src/lib/paymob/utils.ts',
  'src/lib/paymob/webhook.service.ts',
  
  // API Endpoints
  'src/app/api/payments/initiate/route.ts',
  'src/app/api/payments/webhook/route.ts',
  'src/app/api/debug/paymob-auth/route.ts',
  
  // Frontend Components
  'src/components/payment/PaymentFlow.tsx',
  'src/components/payment/PaymentMethodSelector.tsx',
  'src/components/payment/PaymentIframe.tsx',
  'src/components/payment/PaymentStatus.tsx',
  'src/components/payment/CourseInfo.tsx',
  
  // API Client & Utils
  'src/lib/api/payments.ts',
  'src/lib/payment-utils.ts',
  
  // Configuration Files
  '.env',
  '.env.example',
  'package.json',
  
  // Test Scripts
  'scripts/test-mobile-wallet-simple.ts',
  'scripts/test-mobile-wallet-payment.ts',
  
  // Documentation Files
  'MOBILE_WALLET_FINAL_SOLUTION.md',
  'MOBILE_WALLET_FIX_SUMMARY.md',
  'MOBILE_WALLET_FIXES_SUMMARY.md',
  'AUTHENTICATION_DEBUG_GUIDE.md',
  'docs/MOBILE_WALLET_INTEGRATION_GUIDE.md',
  
  // Database Schema
  'prisma/schema.prisma'
];

function generateReport() {
  let report = '';
  
  // Header
  report += '# Mobile Wallet Payment Issue - Complete Code Report\n';
  report += '# Generated on: ' + new Date().toISOString() + '\n';
  report += '# Issue: Mobile wallet payments showing credit card iframe instead of mobile wallet options\n';
  report += '# Root Cause: Using same iframe ID (927389) for both credit cards and mobile wallets\n';
  report += '# Solution: Need separate iframe ID for mobile wallets in PayMob dashboard\n\n';
  report += '=' .repeat(100) + '\n\n';
  
  // Table of Contents
  report += '## TABLE OF CONTENTS\n\n';
  let sectionNumber = 1;
  
  const sections = [
    'Core PayMob Integration Files',
    'API Endpoints',
    'Frontend Components', 
    'API Client & Utils',
    'Configuration Files',
    'Test Scripts',
    'Documentation Files',
    'Database Schema'
  ];
  
  sections.forEach(section => {
    report += `${sectionNumber}. ${section}\n`;
    sectionNumber++;
  });
  report += '\n' + '=' .repeat(100) + '\n\n';
  
  // Process each section
  sectionNumber = 1;
  
  // Section 1: Core PayMob Integration Files
  report += `## ${sectionNumber}. CORE PAYMOB INTEGRATION FILES\n\n`;
  sectionNumber++;
  
  const coreFiles = [
    'src/lib/paymob/mobile-wallet.service.ts',
    'src/lib/paymob/payment.service.ts', 
    'src/lib/paymob/client.ts',
    'src/lib/paymob/config.ts',
    'src/lib/paymob/types.ts',
    'src/lib/paymob/utils.ts',
    'src/lib/paymob/webhook.service.ts'
  ];
  
  coreFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 2: API Endpoints
  report += `## ${sectionNumber}. API ENDPOINTS\n\n`;
  sectionNumber++;
  
  const apiFiles = [
    'src/app/api/payments/initiate/route.ts',
    'src/app/api/payments/webhook/route.ts',
    'src/app/api/debug/paymob-auth/route.ts'
  ];
  
  apiFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 3: Frontend Components
  report += `## ${sectionNumber}. FRONTEND COMPONENTS\n\n`;
  sectionNumber++;
  
  const componentFiles = [
    'src/components/payment/PaymentFlow.tsx',
    'src/components/payment/PaymentMethodSelector.tsx',
    'src/components/payment/PaymentIframe.tsx',
    'src/components/payment/PaymentStatus.tsx',
    'src/components/payment/CourseInfo.tsx'
  ];
  
  componentFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 4: API Client & Utils
  report += `## ${sectionNumber}. API CLIENT & UTILS\n\n`;
  sectionNumber++;
  
  const utilFiles = [
    'src/lib/api/payments.ts',
    'src/lib/payment-utils.ts'
  ];
  
  utilFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 5: Configuration Files
  report += `## ${sectionNumber}. CONFIGURATION FILES\n\n`;
  sectionNumber++;
  
  const configFiles = [
    '.env',
    '.env.example',
    'package.json'
  ];
  
  configFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 6: Test Scripts
  report += `## ${sectionNumber}. TEST SCRIPTS\n\n`;
  sectionNumber++;
  
  const testFiles = [
    'scripts/test-mobile-wallet-simple.ts',
    'scripts/test-mobile-wallet-payment.ts'
  ];
  
  testFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 7: Documentation Files
  report += `## ${sectionNumber}. DOCUMENTATION FILES\n\n`;
  sectionNumber++;
  
  const docFiles = [
    'MOBILE_WALLET_FINAL_SOLUTION.md',
    'MOBILE_WALLET_FIX_SUMMARY.md',
    'MOBILE_WALLET_FIXES_SUMMARY.md',
    'AUTHENTICATION_DEBUG_GUIDE.md',
    'docs/MOBILE_WALLET_INTEGRATION_GUIDE.md'
  ];
  
  docFiles.forEach(filePath => {
    report += processFile(filePath);
  });
  
  // Section 8: Database Schema
  report += `## ${sectionNumber}. DATABASE SCHEMA\n\n`;
  
  report += processFile('prisma/schema.prisma');
  
  // Summary
  report += '\n' + '=' .repeat(100) + '\n';
  report += '## SUMMARY OF THE ISSUE\n\n';
  report += '**PROBLEM**: Mobile wallet payments redirect to credit card iframe\n';
  report += '**ROOT CAUSE**: Using same iframe ID (927389) for both payment methods\n';
  report += '**SOLUTION**: Create separate mobile wallet iframe in PayMob dashboard\n';
  report += '**STATUS**: Code is ready, needs PayMob dashboard configuration\n\n';
  report += '**NEXT STEPS**:\n';
  report += '1. Create new iframe in PayMob dashboard for mobile wallets\n';
  report += '2. Configure it with mobile wallet integration ID (5113429)\n';
  report += '3. Add PAYMOB_IFRAME_ID_MOBILE_WALLET to .env file\n';
  report += '4. Test mobile wallet payments\n\n';
  report += '=' .repeat(100) + '\n';
  
  return report;
}

function processFile(filePath) {
  let content = '';
  
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);
      
      content += `### ${filePath}\n`;
      content += `**Size**: ${stats.size} bytes\n`;
      content += `**Last Modified**: ${stats.mtime.toISOString()}\n`;
      content += `**Lines**: ${fileContent.split('\n').length}\n\n`;
      
      // Add file content with syntax highlighting hint
      const extension = path.extname(filePath);
      let language = '';
      
      switch(extension) {
        case '.ts':
        case '.tsx':
          language = 'typescript';
          break;
        case '.js':
        case '.mjs':
          language = 'javascript';
          break;
        case '.json':
          language = 'json';
          break;
        case '.md':
          language = 'markdown';
          break;
        case '.prisma':
          language = 'prisma';
          break;
        default:
          language = 'text';
      }
      
      content += '```' + language + '\n';
      content += fileContent;
      content += '\n```\n\n';
      content += '-'.repeat(80) + '\n\n';
      
    } else {
      content += `### ${filePath}\n`;
      content += '**STATUS**: FILE NOT FOUND\n\n';
      content += '-'.repeat(80) + '\n\n';
    }
  } catch (error) {
    content += `### ${filePath}\n`;
    content += `**ERROR**: ${error.message}\n\n`;
    content += '-'.repeat(80) + '\n\n';
  }
  
  return content;
}

// Generate and write the report
console.log('🔄 Generating mobile wallet payment issue report...');
const report = generateReport();

fs.writeFileSync(OUTPUT_FILE, report, 'utf8');

console.log(`✅ Report generated successfully: ${OUTPUT_FILE}`);
console.log(`📊 Report size: ${fs.statSync(OUTPUT_FILE).size} bytes`);
console.log(`📁 Files analyzed: ${FILES_TO_ANALYZE.length}`);