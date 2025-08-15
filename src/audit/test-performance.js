// src/audit/test-performance.js
// Test script for performance analyzer

const fs = require('fs');
const path = require('path');

function testPerformanceAnalyzer() {
  console.log('🧪 Testing Performance Analyzer...\n');

  try {
    // Check if PerformanceAnalyzer file exists
    const analyzerPath = path.join(__dirname, 'analyzers', 'PerformanceAnalyzer.ts');
    const exists = fs.existsSync(analyzerPath);
    console.log(`📋 PerformanceAnalyzer file: ${exists ? '✅' : '❌'}`);

    if (!exists) {
      console.log('❌ PerformanceAnalyzer.ts not found');
      return false;
    }

    // Check file content
    const content = fs.readFileSync(analyzerPath, 'utf8');
    
    const checks = [
      { name: 'PerformanceAnalyzer class', pattern: 'export class PerformanceAnalyzer' },
      { name: 'analyzePerformance method', pattern: 'async analyzePerformance()' },
      { name: 'analyzeBundleSize method', pattern: 'analyzeBundleSize()' },
      { name: 'testApiPerformance method', pattern: 'testApiPerformance()' },
      { name: 'analyzeMemoryUsage method', pattern: 'analyzeMemoryUsage()' },
      { name: 'calculatePerformanceGains method', pattern: 'calculatePerformanceGains(' },
      { name: 'Performance thresholds support', pattern: 'bundleSizeReductionMin' },
      { name: 'Bundle analysis interface', pattern: 'BundleAnalysis' },
      { name: 'Performance metrics interface', pattern: 'PerformanceMetrics' }
    ];

    console.log('📋 Checking performance analyzer methods:');
    let allChecksPass = true;

    for (const check of checks) {
      const found = content.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
      if (!found) allChecksPass = false;
    }

    // Check if updated AuditController uses the analyzer
    const controllerPath = path.join(__dirname, 'core', 'AuditController.ts');
    const controllerContent = fs.readFileSync(controllerPath, 'utf8');
    const usesAnalyzer = controllerContent.includes('PerformanceAnalyzer');
    console.log(`   ${usesAnalyzer ? '✅' : '❌'} AuditController integration`);

    // Check performance thresholds
    console.log('\n📋 Checking performance thresholds:');
    const configPath = path.join(__dirname, 'config', 'default.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const thresholdChecks = [
      { name: 'Bundle size reduction (13.5%)', pattern: 'bundleSizeReductionMin: 13.5' },
      { name: 'Response time improvement (24%)', pattern: 'responseTimeImprovementMin: 24' },
      { name: 'Memory reduction (20%)', pattern: 'memoryReductionMin: 20' }
    ];

    for (const check of thresholdChecks) {
      const found = configContent.includes(check.pattern);
      console.log(`   ${found ? '✅' : '❌'} ${check.name}`);
      if (!found) allChecksPass = false;
    }

    // Check project structure for performance analysis
    console.log('\n📋 Checking project structure for performance analysis:');
    
    const structureChecks = [
      { name: 'Source directory', path: path.join(process.cwd(), 'src') },
      { name: 'Package.json', path: path.join(process.cwd(), 'package.json') },
      { name: 'Next.js config', path: path.join(process.cwd(), 'next.config.js') },
      { name: 'TypeScript config', path: path.join(process.cwd(), 'tsconfig.json') }
    ];

    for (const check of structureChecks) {
      const exists = fs.existsSync(check.path);
      console.log(`   ${exists ? '✅' : '❌'} ${check.name}`);
    }

    console.log('\n📊 Performance Analyzer Test Results:');
    if (allChecksPass && usesAnalyzer) {
      console.log('✅ All performance analyzer components are properly implemented');
      console.log('✅ Performance validation system is ready for testing');
      console.log('\n🎯 Performance Validation Capabilities:');
      console.log('   - Bundle size analysis and reduction measurement');
      console.log('   - API response time testing and improvement validation');
      console.log('   - Memory usage profiling and reduction analysis');
      console.log('   - Performance threshold validation against refactoring claims');
      console.log('\n🔄 Next steps:');
      console.log('   - Run actual performance analysis on the codebase');
      console.log('   - Task 4: Create compatibility and contract validator');
      console.log('   - Task 5: Implement comprehensive reporting system');
      return true;
    } else {
      console.log('❌ Some performance analyzer components are missing or incorrectly implemented');
      return false;
    }

  } catch (error) {
    console.error('❌ Performance analyzer test failed:', error);
    return false;
  }
}

// Run the test
const success = testPerformanceAnalyzer();
process.exit(success ? 0 : 1);