// src/audit/cli/audit-cli.ts
// Command-line interface for running comprehensive audits

import { AuditController } from '../core/AuditController';
import { AuditReporter } from '../reporters/AuditReporter';
import { 
  DEFAULT_AUDIT_CONFIG,
  INTEGRATION_ONLY_CONFIG,
  PERFORMANCE_ONLY_CONFIG,
  COMPATIBILITY_ONLY_CONFIG,
  CI_AUDIT_CONFIG,
  createAuditConfig
} from '../config/default.config';
import { AuditPhase } from '../types';

export interface CliOptions {
  config?: 'default' | 'integration' | 'performance' | 'compatibility' | 'ci';
  phases?: string[];
  output?: string;
  format?: 'json' | 'markdown' | 'both';
  verbose?: boolean;
  help?: boolean;
}

export class AuditCli {
  private options: CliOptions;

  constructor(options: CliOptions = {}) {
    this.options = options;
  }

  /**
   * Run audit from command line
   */
  async run(): Promise<void> {
    try {
      if (this.options.help) {
        this.showHelp();
        return;
      }

      console.log('🔍 System Integration & Consistency Audit');
      console.log('==========================================\n');

      // 1. Determine audit configuration
      const config = this.getAuditConfig();
      
      if (this.options.verbose) {
        console.log('📋 Audit Configuration:');
        console.log(`   - Phases: ${config.phases.join(', ')}`);
        console.log(`   - Bundle size threshold: ${config.thresholds.bundleSizeReductionMin}%`);
        console.log(`   - Response time threshold: ${config.thresholds.responseTimeImprovementMin}%`);
        console.log(`   - Memory threshold: ${config.thresholds.memoryReductionMin}%`);
        console.log('');
      }

      // 2. Execute audit
      const controller = new AuditController(config);
      const startTime = Date.now();
      
      console.log('🚀 Starting comprehensive audit...\n');
      const auditResult = await controller.executeAudit();
      
      const duration = Date.now() - startTime;
      console.log(`\n⏱️ Audit completed in ${duration}ms\n`);

      // 3. Generate reports
      const outputPath = this.options.output || './audit-results';
      const reporter = new AuditReporter(outputPath);
      
      console.log('📊 Generating comprehensive reports...');
      const detailedReport = await reporter.generateReport(auditResult);

      // 4. Display summary
      this.displaySummary(auditResult, detailedReport);

      // 5. Exit with appropriate code
      const exitCode = auditResult.overall === 'PASS' ? 0 : 1;
      process.exit(exitCode);

    } catch (error) {
      console.error('❌ Audit execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Get audit configuration based on options
   */
  private getAuditConfig() {
    // Handle custom phases
    if (this.options.phases && this.options.phases.length > 0) {
      const phases = this.options.phases.map(phase => {
        const upperPhase = phase.toUpperCase();
        if (Object.values(AuditPhase).includes(upperPhase as AuditPhase)) {
          return upperPhase as AuditPhase;
        }
        throw new Error(`Invalid phase: ${phase}`);
      });

      return createAuditConfig({
        phases,
        reporting: {
          generateExecutiveSummary: true,
          includeDetailedMetrics: true,
          outputFormat: this.options.format === 'json' ? 'JSON' : 'MARKDOWN',
          outputPath: this.options.output || './audit-results'
        }
      });
    }

    // Handle preset configurations
    switch (this.options.config) {
      case 'integration':
        return INTEGRATION_ONLY_CONFIG;
      case 'performance':
        return PERFORMANCE_ONLY_CONFIG;
      case 'compatibility':
        return COMPATIBILITY_ONLY_CONFIG;
      case 'ci':
        return CI_AUDIT_CONFIG;
      default:
        return DEFAULT_AUDIT_CONFIG;
    }
  }

  /**
   * Display audit summary
   */
  private displaySummary(auditResult: any, detailedReport: any): void {
    console.log('📊 AUDIT SUMMARY');
    console.log('================\n');

    // Overall status
    const statusIcon = auditResult.overall === 'PASS' ? '✅' : 
                      auditResult.overall === 'WARNING' ? '⚠️' : '❌';
    console.log(`${statusIcon} Overall Status: ${auditResult.overall}`);
    console.log(`📈 Readiness Score: ${detailedReport.executiveSummary.readinessScore}%`);
    console.log(`🚨 Critical Issues: ${detailedReport.executiveSummary.criticalIssues}`);
    console.log(`⚠️ Warning Issues: ${detailedReport.executiveSummary.warningIssues}\n`);

    // Performance summary
    console.log('🚀 PERFORMANCE GAINS');
    console.log('====================');
    const perf = detailedReport.executiveSummary.performanceGains;
    console.log(`📦 Bundle Size Reduction: ${perf.bundleSizeReduction.toFixed(1)}% (Target: 13.5%)`);
    console.log(`⚡ Response Time Improvement: ${perf.responseTimeImprovement.toFixed(1)}% (Target: 24%)`);
    console.log(`🧠 Memory Reduction: ${perf.memoryReduction.toFixed(1)}% (Target: 20%)`);
    console.log(`🎯 All Targets Met: ${perf.meetsAllTargets ? 'Yes' : 'No'}\n`);

    // Compatibility summary
    console.log('🔄 COMPATIBILITY STATUS');
    console.log('=======================');
    console.log(`Status: ${detailedReport.executiveSummary.compatibilityStatus}\n`);

    // Phase results
    console.log('📋 PHASE RESULTS');
    console.log('================');
    for (const phase of auditResult.phases) {
      const phaseIcon = phase.status === 'PASS' ? '✅' : 
                       phase.status === 'WARNING' ? '⚠️' : '❌';
      console.log(`${phaseIcon} ${phase.phase}: ${phase.status}`);
    }
    console.log('');

    // Top recommendations
    if (detailedReport.executiveSummary.recommendations.length > 0) {
      console.log('💡 TOP RECOMMENDATIONS');
      console.log('======================');
      for (const rec of detailedReport.executiveSummary.recommendations) {
        console.log(`• ${rec}`);
      }
      console.log('');
    }

    // Report location
    console.log('📁 REPORTS GENERATED');
    console.log('===================');
    console.log(`Reports saved to: ${this.options.output || './audit-results'}`);
    console.log('• Detailed JSON report');
    console.log('• Markdown report');
    console.log('• Executive summary\n');

    // Deployment readiness
    const readinessScore = detailedReport.executiveSummary.readinessScore;
    console.log('🚀 DEPLOYMENT READINESS');
    console.log('=======================');
    if (readinessScore >= 90) {
      console.log('✅ Ready for production deployment');
    } else if (readinessScore >= 75) {
      console.log('⚠️ Nearly ready - minor improvements needed');
    } else {
      console.log('❌ Requires additional work before deployment');
    }
    console.log('');
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🔍 System Integration & Consistency Audit CLI

USAGE:
  npm run audit [options]
  node src/audit/cli/audit-cli.js [options]

OPTIONS:
  --config <preset>     Use preset configuration
                        Options: default, integration, performance, compatibility, ci
                        Default: default

  --phases <phases>     Run specific phases (comma-separated)
                        Options: static_analysis, integration_analysis, 
                                performance_validation, compatibility_validation
                        Example: --phases static_analysis,performance_validation

  --output <path>       Output directory for reports
                        Default: ./audit-results

  --format <format>     Report format
                        Options: json, markdown, both
                        Default: both

  --verbose             Enable verbose output
  --help               Show this help message

EXAMPLES:
  # Run full audit with default configuration
  npm run audit

  # Run only integration analysis
  npm run audit --config integration

  # Run specific phases
  npm run audit --phases static_analysis,performance_validation

  # Run with custom output directory
  npm run audit --output ./my-audit-results

  # Run CI-optimized audit
  npm run audit --config ci --format json

  # Run with verbose output
  npm run audit --verbose

PRESET CONFIGURATIONS:
  default       - Full audit with all phases
  integration   - Integration and type system validation only
  performance   - Performance and bundle analysis only
  compatibility - Compatibility and contract validation only
  ci           - Optimized for CI/CD pipelines (faster execution)

PERFORMANCE THRESHOLDS:
  Bundle Size Reduction:     ≥ 13.5%
  Response Time Improvement: ≥ 24%
  Memory Usage Reduction:    ≥ 20%

EXIT CODES:
  0 - Audit passed successfully
  1 - Audit failed or found critical issues

For more information, visit: https://github.com/your-repo/audit-system
`);
  }
}

/**
 * Parse command line arguments
 */
export function parseCliArgs(args: string[]): CliOptions {
  const options: CliOptions = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--config':
        options.config = args[++i] as any;
        break;
      case '--phases':
        options.phases = args[++i]?.split(',').map(p => p.trim());
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        options.format = args[++i] as any;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }
  
  return options;
}

/**
 * Main CLI entry point
 */
export async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseCliArgs(args);
  
  const cli = new AuditCli(options);
  await cli.run();
}

// Run CLI if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('CLI execution failed:', error);
    process.exit(1);
  });
}