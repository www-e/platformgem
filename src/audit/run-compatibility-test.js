// src/audit/run-compatibility-test.js
// Quick compatibility analysis test

const fs = require('fs');
const path = require('path');

async function runCompatibilityTest() {
  console.log('🔍 Running Compatibility Analysis Test...\n');

  try {
    // 1. API Contract Analysis
    console.log('📋 Analyzing API contracts:');
    const apiPath = path.join(process.cwd(), 'src', 'app', 'api');
    const apiRoutes = findApiRoutes(apiPath);
    console.log(`   📊 Total API routes found: ${apiRoutes.length}`);

    let unifiedResponseCount = 0;
    let consistentErrorCount = 0;
    let authIntegrationCount = 0;

    for (const route of apiRoutes.slice(0, 10)) { // Check first 10 routes
      const content = fs.readFileSync(route, 'utf8');
      const routeName = path.relative(apiPath, route);
      
      // Check for unified response system
      if (content.includes('createSuccessResponse') || content.includes('createErrorResponse')) {
        unifiedResponseCount++;
        console.log(`   ✅ ${routeName}: Uses unified response system`);
      } else {
        console.log(`   ⚠️ ${routeName}: May not use unified response system`);
      }

      // Check for consistent error handling
      if (content.includes('withErrorHandling') || content.includes('try') && content.includes('catch')) {
        consistentErrorCount++;
      }

      // Check for authentication integration
      if (content.includes('authenticateApiUser') || content.includes('auth()')) {
        authIntegrationCount++;
      }
    }

    console.log(`   📊 Unified responses: ${unifiedResponseCount}/${Math.min(10, apiRoutes.length)} routes`);
    console.log(`   📊 Error handling: ${consistentErrorCount}/${Math.min(10, apiRoutes.length)} routes`);
    console.log(`   📊 Authentication: ${authIntegrationCount}/${Math.min(10, apiRoutes.length)} routes`);

    // 2. Backward Compatibility Analysis
    console.log('\n📋 Analyzing backward compatibility:');
    
    // Check for deprecated files that should still work
    const deprecatedFiles = [
      { name: 'utils.ts', path: 'src/lib/utils.ts' },
      { name: 'shared-utils.ts', path: 'src/lib/shared-utils.ts' },
      { name: 'analytics-utils.ts', path: 'src/lib/analytics-utils.ts' }
    ];

    let workingDeprecatedFiles = 0;
    for (const file of deprecatedFiles) {
      if (fs.existsSync(file.path)) {
        const content = fs.readFileSync(file.path, 'utf8');
        // Check if it's a compatibility layer (imports from core-utils)
        if (content.includes('@/lib/core-utils') || content.includes('core-utils')) {
          workingDeprecatedFiles++;
          console.log(`   ✅ ${file.name}: Compatibility layer working`);
        } else {
          console.log(`   ⚠️ ${file.name}: May not be properly updated`);
        }
      } else {
        console.log(`   ❌ ${file.name}: File not found`);
      }
    }

    // 3. Import Analysis
    console.log('\n📋 Analyzing import patterns:');
    const libFiles = findTsFiles(path.join(process.cwd(), 'src', 'lib'));
    let unifiedImportCount = 0;
    let deprecatedImportCount = 0;

    for (const file of apiRoutes.slice(0, 5)) { // Check first 5 API routes
      const content = fs.readFileSync(file, 'utf8');
      const imports = extractImports(content);
      
      for (const importPath of imports) {
        if (importPath.includes('@/lib/api') || importPath.includes('@/lib/core-utils')) {
          unifiedImportCount++;
        }
        if (importPath.includes('@/lib/utils') || importPath.includes('@/lib/shared-utils')) {
          deprecatedImportCount++;
        }
      }
    }

    console.log(`   📊 Unified imports: ${unifiedImportCount} found`);
    console.log(`   📊 Deprecated imports: ${deprecatedImportCount} found`);

    // 4. Error Response Analysis
    console.log('\n📋 Analyzing error responses:');
    let arabicErrorCount = 0;
    let consistentFormatCount = 0;

    for (const route of apiRoutes.slice(0, 5)) {
      const content = fs.readFileSync(route, 'utf8');
      
      // Check for Arabic error messages
      if (/[\u0600-\u06FF]/.test(content) || content.includes('غير مصرح')) {
        arabicErrorCount++;
      }

      // Check for consistent error format
      if (content.includes('createErrorResponse') || content.includes('ApiResponse')) {
        consistentFormatCount++;
      }
    }

    console.log(`   📊 Arabic error messages: ${arabicErrorCount}/5 routes`);
    console.log(`   📊 Consistent error format: ${consistentFormatCount}/5 routes`);

    // 5. Database Integration Analysis
    console.log('\n📋 Analyzing database integration:');
    let optimizedQueryCount = 0;
    let transactionCount = 0;

    for (const route of apiRoutes.slice(0, 5)) {
      const content = fs.readFileSync(route, 'utf8');
      
      // Check for optimized Prisma queries
      if (content.includes('prisma.') && (content.includes('select') || content.includes('include'))) {
        optimizedQueryCount++;
      }

      // Check for transaction handling
      if (content.includes('$transaction') || content.includes('executeTransaction')) {
        transactionCount++;
      }
    }

    console.log(`   📊 Optimized queries: ${optimizedQueryCount}/5 routes`);
    console.log(`   📊 Transaction handling: ${transactionCount}/5 routes`);

    // 6. Overall Compatibility Assessment
    console.log('\n✅ Compatibility Analysis Summary:');
    
    const apiCompatibility = (unifiedResponseCount / Math.min(10, apiRoutes.length)) * 100;
    const backwardCompatibility = (workingDeprecatedFiles / deprecatedFiles.length) * 100;
    const importCompatibility = unifiedImportCount > deprecatedImportCount ? 100 : 50;
    const errorCompatibility = (consistentFormatCount / 5) * 100;
    
    console.log(`   - API contract compatibility: ${apiCompatibility.toFixed(1)}%`);
    console.log(`   - Backward compatibility: ${backwardCompatibility.toFixed(1)}%`);
    console.log(`   - Import pattern consistency: ${importCompatibility.toFixed(1)}%`);
    console.log(`   - Error response consistency: ${errorCompatibility.toFixed(1)}%`);
    
    const overallCompatibility = (apiCompatibility + backwardCompatibility + importCompatibility + errorCompatibility) / 4;
    console.log(`   - Overall compatibility score: ${overallCompatibility.toFixed(1)}%`);

    const compatibilityStatus = overallCompatibility >= 90 ? '✅ Excellent' : 
                               overallCompatibility >= 75 ? '⚠️ Good' : '❌ Needs Improvement';
    console.log(`   - Compatibility status: ${compatibilityStatus}`);

    console.log('\n🔄 Compatibility analyzer is ready for comprehensive validation');
    return true;

  } catch (error) {
    console.error('❌ Compatibility test failed:', error);
    return false;
  }
}

function findApiRoutes(apiPath) {
  const routes = [];
  
  if (!fs.existsSync(apiPath)) {
    return routes;
  }

  function findRoutes(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findRoutes(fullPath);
      } else if (item === 'route.ts') {
        routes.push(fullPath);
      }
    }
  }

  findRoutes(apiPath);
  return routes;
}

function findTsFiles(directory) {
  const files = [];
  
  if (!fs.existsSync(directory)) {
    return files;
  }

  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const fullPath = path.join(directory, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractImports(content) {
  const imports = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      imports.push(importMatch[1]);
    }
  }
  
  return imports;
}

// Run the test
runCompatibilityTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });