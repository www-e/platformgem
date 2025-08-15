// src/audit/verify-structure.js
// Simple verification script to check audit framework structure

const fs = require('fs');
const path = require('path');

function verifyAuditStructure() {
  console.log('🧪 Verifying Audit Framework Structure...\n');

  const requiredFiles = [
    'types/index.ts',
    'core/AuditController.ts',
    'config/default.config.ts',
    'index.ts',
    'test-audit.ts'
  ];

  let allFilesExist = true;

  console.log('📋 Checking required files:');
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    
    if (!exists) {
      allFilesExist = false;
    }
  }

  console.log('\n📋 Checking file contents:');
  
  // Check types file
  const typesContent = fs.readFileSync(path.join(__dirname, 'types/index.ts'), 'utf8');
  const hasAuditPhase = typesContent.includes('export enum AuditPhase');
  const hasAuditConfig = typesContent.includes('export interface AuditConfig');
  console.log(`   ${hasAuditPhase ? '✅' : '❌'} AuditPhase enum defined`);
  console.log(`   ${hasAuditConfig ? '✅' : '❌'} AuditConfig interface defined`);

  // Check controller file
  const controllerContent = fs.readFileSync(path.join(__dirname, 'core/AuditController.ts'), 'utf8');
  const hasAuditController = controllerContent.includes('export class AuditController');
  const hasExecuteAudit = controllerContent.includes('async executeAudit()');
  console.log(`   ${hasAuditController ? '✅' : '❌'} AuditController class defined`);
  console.log(`   ${hasExecuteAudit ? '✅' : '❌'} executeAudit method defined`);

  // Check config file
  const configContent = fs.readFileSync(path.join(__dirname, 'config/default.config.ts'), 'utf8');
  const hasDefaultConfig = configContent.includes('export const DEFAULT_AUDIT_CONFIG');
  const hasThresholds = configContent.includes('bundleSizeReductionMin: 13.5');
  console.log(`   ${hasDefaultConfig ? '✅' : '❌'} DEFAULT_AUDIT_CONFIG defined`);
  console.log(`   ${hasThresholds ? '✅' : '❌'} Performance thresholds configured`);

  console.log('\n📊 Structure Verification Results:');
  if (allFilesExist && hasAuditPhase && hasAuditConfig && hasAuditController && hasExecuteAudit && hasDefaultConfig && hasThresholds) {
    console.log('✅ All required components are present and correctly structured');
    console.log('✅ Audit framework infrastructure is ready for implementation');
    console.log('\n🔄 Next steps:');
    console.log('   - Task 2: Implement TypeScript compilation validator');
    console.log('   - Task 3: Create import consistency checker');
    console.log('   - Task 4: Build dependency graph analyzer');
    return true;
  } else {
    console.log('❌ Some components are missing or incorrectly structured');
    return false;
  }
}

// Run verification
const success = verifyAuditStructure();
process.exit(success ? 0 : 1);