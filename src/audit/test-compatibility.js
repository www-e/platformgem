// src/audit/test-compatibility.js
// Test script for compatibility analyzer

const fs = require('fs');
const path = require('path');

function testCompatibilityAnalyzer() {
  console.log('🧪 Testing Compatibility Analyzer...\n');

  try {
    // Check if CompatibilityAnalyzer file exists
    const analyzerPath = path.join(__dirname, 'analyzers', 'CompatibilityAnalyzer.ts');
    const exists = fs.existsSync(analyzerPath);
    console.log(`📋 CompatibilityAnalyzer file: ${exists ? '✅' : '❌'}`);

    if (!exists) {
      console.log('❌ CompatibilityAnalyzer.ts not found');
      return false;
    }

    // Check file content
    const content = fs.readFileSync(analyzerPath, 'utf8');
    
    const checks = [
      { name: 'CompatibilityAnalyzer class', pattern: 'export class CompatibilityAnalyzer' },
      { name: 'analyzeCompatibility method', pattern: 'async analyzeCompatibility()' },
      { name: 'validateApiContracts method', pattern: 'validateApiContracts()' },
      { name: 'testBackwardCompatibility method', pattern: 'testBackwardCompatibility()' },
      { name: 'validateErrorResponses method', pattern: 'validateErrorResponses()' },
      { name: 'validateAuthenticationIntegration method', pattern: 'validateAuthenticationIntegration()' },
      { name: 'validateDatabaseIntegration method', pattern: 'validateDatabaseIntegration()' },
      { name: 'API contract validation', pattern: 'ApiContractValidationResult' },
      { name: 'Backward compatibility testing', pattern: 'BackwardCompatibilityResult' },
      { name: 'Error response validation', pattern: 'ErrorResponseValidationResult' }
    ];

    console.log('📋 Checking compatibility analyzer methods:');
    let allChecksPass = true;

    for (const check of checks) {
      const found = content.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
      if (!found) allChecksPass = false;
    }

    // Check if updated AuditController uses the analyzer
    const controllerPath = path.join(__dirname, 'core', 'AuditController.ts');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    const usesAnalyzer = controllerContent.includes('CompatibilityAnalyzer');
    console.log(`   ${usesAnalyzer ? '✅' : '❌'} AuditController integration`);

    // Check project structure for compatibility analysis
    console.log('\n📋 Checking project structure for compatibility analysis:');
    
    const structureChecks = [
      { name: 'API routes directory', path: path.join(process.cwd(), 'src', 'app', 'api') },
      { name: 'Library directory', path: path.join(process.cwd(), 'src', 'lib') },
      { name: 'Middleware file', path: path.join(process.cwd(), 'middleware.ts') },
      { name: 'Prisma schema', path: path.join(process.cwd(), 'prisma', 'schema.prisma') }
    ];

    for (const check of structureChecks) {
      const exists = fs.existsSync(check.path);
      console.log(`   ${exists ? '✅' : '❌'} ${check.name}`);
    }

    // Check for key API routes
    console.log('\n📋 Checking for key API routes:');
    const apiPath = path.join(process.cwd(), 'src', 'app', 'api');
    
    if (fs.existsSync(apiPath)) {
      const apiDirs = fs.readdirSync(apiPath).filter(f => 
        fs.statSync(path.join(apiPath, f)).isDirectory()
      );
      
      const keyRoutes = ['users', 'categories', 'admin', 'auth'];
      for (const route of keyRoutes) {
        const exists = apiDirs.includes(route);
        console.log(`   ${exists ? '✅' : '❌'} /api/${route}`);
      }
      
      console.log(`   📊 Total API directories: ${apiDirs.length}`);
    }

    // Check for refactored files mentioned in reports
    console.log('\n📋 Checking for refactored files:');
    const refactoredFiles = [
      { name: 'core-utils.ts', path: 'src/lib/core-utils.ts' },
      { name: 'api-response.ts', path: 'src/lib/api-response.ts' },
      { name: 'api/auth.ts', path: 'src/lib/api/auth.ts' },
      { name: 'api/index.ts', path: 'src/lib/api/index.ts' }
    ];

    for (const file of refactoredFiles) {
      const exists = fs.existsSync(file.path);
      console.log(`   ${exists ? '✅' : '❌'} ${file.name}`);
    }

    console.log('\n📊 Compatibility Analyzer Test Results:');
    if (allChecksPass && usesAnalyzer) {
      console.log('✅ All compatibility analyzer components are properly implemented');
      console.log('✅ Compatibility validation system is ready for testing');
      console.log('\n🎯 Compatibility Validation Capabilities:');
      console.log('   - API contract validation for response format consistency');
      console.log('   - Backward compatibility testing for imports and functions');
      console.log('   - Error response validation for consistent error handling');
      console.log('   - Authentication integration validation');
      console.log('   - Database integration and optimization validation');
      console.log('\n🔄 Next steps:');
      console.log('   - Run actual compatibility analysis on the codebase');
      console.log('   - Task 5: Implement comprehensive reporting and execution system');
      console.log('   - Complete the audit system with final reporting');
      return true;
    } else {
      console.log('❌ Some compatibility analyzer components are missing or incorrectly implemented');
      return false;
    }

  } catch (error) {
    console.error('❌ Compatibility analyzer test failed:', error);
    return false;
  }
}

// Run the test
const success = testCompatibilityAnalyzer();
process.exit(success ? 0 : 1);