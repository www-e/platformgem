// src/audit/test-integration.ts
// Test script for integration analyzer

import { AuditController, DEFAULT_AUDIT_CONFIG, AuditPhase } from './index';

async function testIntegrationAnalyzer() {
  console.log('🧪 Testing Integration Analyzer...\n');

  try {
    // Create audit controller with only static analysis phase
    const config = {
      ...DEFAULT_AUDIT_CONFIG,
      phases: [AuditPhase.STATIC_ANALYSIS]
    };

    const auditController = new AuditController(config);
    
    console.log('📋 Running integration and type system analysis...');
    const result = await auditController.executeAudit();
    
    console.log('\n📊 Integration Analysis Results:');
    console.log(`   - Overall Status: ${result.overall}`);
    console.log(`   - Issues Found: ${result.issues.length}`);
    
    if (result.phases.length > 0) {
      const phase = result.phases[0];
      console.log(`   - Phase Status: ${phase.status}`);
      console.log(`   - Metrics: ${JSON.stringify(phase.metrics, null, 2)}`);
      
      console.log('\n📋 Findings:');
      for (const finding of phase.findings) {
        const icon = finding.impact === 'POSITIVE' ? '✅' : 
                    finding.impact === 'NEGATIVE' ? '❌' : '⚠️';
        console.log(`   ${icon} ${finding.category}: ${finding.description}`);
      }
    }

    if (result.issues.length > 0) {
      console.log('\n⚠️ Issues Found:');
      for (const issue of result.issues) {
        console.log(`   - ${issue.severity}: ${issue.message} (${issue.location})`);
      }
    }

    console.log('\n✅ Integration analyzer test completed successfully!');
    return true;

  } catch (error) {
    console.error('\n❌ Integration analyzer test failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testIntegrationAnalyzer()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testIntegrationAnalyzer };