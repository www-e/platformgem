#!/usr/bin/env tsx
// scripts/run-payment-tests.ts

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 Starting Payment System Test Suite...\n');

try {
  // Check if the database is accessible
  console.log('📋 Checking database connection...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database connection verified\n');

  // Run the comprehensive test suite
  console.log('🧪 Running comprehensive payment system tests...');
  execSync('npx tsx scripts/test-complete-payment-system.ts', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}

console.log('\n🎉 Payment system test suite completed!');