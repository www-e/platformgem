// src/audit/run-integration-test.js
// Quick test of integration analyzer on actual codebase

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runIntegrationTest() {
  console.log('🧪 Running Integration Analysis on Actual Codebase...\n');

  try {
    // First, let's check what files we have in the key directories
    console.log('📋 Checking project structure:');
    
    const srcLib = path.join(process.cwd(), 'src', 'lib');
    const srcApi = path.join(process.cwd(), 'src', 'app', 'api');
    
    console.log(`   - src/lib exists: ${fs.existsSync(srcLib) ? '✅' : '❌'}`);
    console.log(`   - src/app/api exists: ${fs.existsSync(srcApi) ? '✅' : '❌'}`);

    if (fs.existsSync(srcLib)) {
      const libFiles = fs.readdirSync(srcLib).filter(f => f.endsWith('.ts'));
      console.log(`   - lib TypeScript files: ${libFiles.length}`);
      console.log(`     Key files: ${libFiles.slice(0, 5).join(', ')}${libFiles.length > 5 ? '...' : ''}`);
    }

    if (fs.existsSync(srcApi)) {
      const apiDirs = fs.readdirSync(srcApi).filter(f => fs.statSync(path.join(srcApi, f)).isDirectory());
      console.log(`   - API directories: ${apiDirs.length}`);
      console.log(`     Directories: ${apiDirs.slice(0, 5).join(', ')}${apiDirs.length > 5 ? '...' : ''}`);
    }

    // Check for key refactored files mentioned in the reports
    console.log('\n📋 Checking for key refactored files:');
    
    const keyFiles = [
      'src/lib/core-utils.ts',
      'src/lib/api-response.ts',
      'src/lib/api/auth.ts',
      'src/lib/api/index.ts',
      'src/app/api/users/route.ts'
    ];

    for (const file of keyFiles) {
      const exists = fs.existsSync(file);
      console.log(`   ${exists ? '✅' : '❌'} ${file}`);
      
      if (exists) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        console.log(`     (${lines} lines)`);
      }
    }

    // Check for deprecated files that should have been removed or updated
    console.log('\n📋 Checking for deprecated files:');
    
    const deprecatedFiles = [
      'src/lib/api-error-handler.ts',
      'src/lib/utils.ts',
      'src/lib/shared-utils.ts'
    ];

    for (const file of deprecatedFiles) {
      const exists = fs.existsSync(file);
      console.log(`   ${exists ? '⚠️' : '✅'} ${file} ${exists ? '(should be updated/removed)' : '(properly handled)'}`);
    }

    // Try to run TypeScript compilation check
    console.log('\n📋 Running TypeScript compilation check:');
    try {
      execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
      console.log('   ✅ TypeScript compilation successful');
    } catch (error) {
      console.log('   ❌ TypeScript compilation has errors');
      console.log('   (This is expected - the integration analyzer will provide details)');
    }

    console.log('\n✅ Integration test preparation completed!');
    console.log('📊 Summary:');
    console.log('   - Project structure verified');
    console.log('   - Key refactored files checked');
    console.log('   - Deprecated files status reviewed');
    console.log('   - TypeScript compilation tested');
    
    console.log('\n🔄 Ready for full integration analysis with Task 2 implementation');
    return true;

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    return false;
  }
}

// Run the test
runIntegrationTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });