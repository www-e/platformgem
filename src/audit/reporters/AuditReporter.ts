// src/audit/reporters/AuditReporter.ts
// Comprehensive audit reporting system

import * as fs from 'fs';
import * as path from 'path';
import { AuditResult, AuditStatus, PhaseResult, Finding } from '../types';

export interface ExecutiveSummary {
  overallStatus: AuditStatus;
  criticalIssues: number;
  warningIssues: number;
  performanceGains: PerformanceSummary;
  compatibilityStatus: 'MAINTAINED' | 'PARTIAL' | 'BROKEN';
  recommendations: string[];
  readinessScore: number;
}

export interface PerformanceSummary {
  bundleSizeReduction: number;
  responseTimeImprovement: number;
  memoryReduction: number;
  meetsAllTargets: boolean;
}

export interface DetailedReport {
  executiveSummary: ExecutiveSummary;
  phaseResults: PhaseAnalysis[];
  keyFindings: KeyFinding[];
  performanceMetrics: PerformanceMetrics;
  compatibilityAnalysis: CompatibilityAnalysis;
  recommendations: RecommendationSection[];
  conclusion: string;
}

export interface PhaseAnalysis {
  phase: string;
  status: AuditStatus;
  summary: string;
  keyMetrics: Record<string, number>;
  criticalFindings: string[];
  recommendations: string[];
}

export interface KeyFinding {
  category: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidence: string;
  recommendation: string;
}

export interface PerformanceMetrics {
  bundleAnalysis: {
    currentSize: string;
    reduction: string;
    targetMet: boolean;
  };
  apiPerformance: {
    averageResponseTime: string;
    improvement: string;
    targetMet: boolean;
  };
  memoryUsage: {
    currentUsage: string;
    reduction: string;
    targetMet: boolean;
  };
}

export interface CompatibilityAnalysis {
  backwardCompatibility: {
    status: string;
    workingImports: string;
    issues: string[];
  };
  apiContracts: {
    status: string;
    validatedEndpoints: string;
    issues: string[];
  };
  errorHandling: {
    status: string;
    consistency: string;
    issues: string[];
  };
}

export interface RecommendationSection {
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendations: string[];
  actionItems: string[];
}

export class AuditReporter {
  private outputPath: string;

  constructor(outputPath: string = './audit-results') {
    this.outputPath = outputPath;
    this.ensureOutputDirectory();
  }

  /**
   * Generate comprehensive audit report
   */
  async generateReport(auditResult: AuditResult): Promise<DetailedReport> {
    console.log('📊 Generating comprehensive audit report...');

    try {
      // 1. Generate executive summary
      const executiveSummary = this.generateExecutiveSummary(auditResult);

      // 2. Analyze phase results
      const phaseResults = this.analyzePhaseResults(auditResult.phases);

      // 3. Extract key findings
      const keyFindings = this.extractKeyFindings(auditResult);

      // 4. Generate performance metrics
      const performanceMetrics = this.generatePerformanceMetrics(auditResult);

      // 5. Generate compatibility analysis
      const compatibilityAnalysis = this.generateCompatibilityAnalysis(auditResult);

      // 6. Generate recommendations
      const recommendations = this.generateRecommendations(auditResult);

      // 7. Generate conclusion
      const conclusion = this.generateConclusion(auditResult, executiveSummary);

      const detailedReport: DetailedReport = {
        executiveSummary,
        phaseResults,
        keyFindings,
        performanceMetrics,
        compatibilityAnalysis,
        recommendations,
        conclusion
      };

      // 8. Save reports in multiple formats
      await this.saveReports(detailedReport, auditResult);

      console.log('✅ Comprehensive audit report generated');
      return detailedReport;

    } catch (error) {
      console.error('❌ Report generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate executive summary
   */
  private generateExecutiveSummary(auditResult: AuditResult): ExecutiveSummary {
    const criticalIssues = auditResult.issues.filter(i => i.severity === 'CRITICAL').length;
    const warningIssues = auditResult.issues.filter(i => i.severity === 'HIGH' || i.severity === 'MEDIUM').length;

    // Extract performance gains from metrics
    const performanceGains: PerformanceSummary = {
      bundleSizeReduction: auditResult.metrics.bundleSizeReduction || 0,
      responseTimeImprovement: auditResult.metrics.responseTimeImprovement || 0,
      memoryReduction: auditResult.metrics.memoryReduction || 0,
      meetsAllTargets: this.checkPerformanceTargets(auditResult.metrics)
    };

    // Determine compatibility status
    const compatibilityStatus = this.determineCompatibilityStatus(auditResult);

    // Calculate readiness score
    const readinessScore = this.calculateReadinessScore(auditResult, performanceGains, compatibilityStatus);

    // Generate top recommendations
    const recommendations = this.generateTopRecommendations(auditResult);

    return {
      overallStatus: auditResult.overall,
      criticalIssues,
      warningIssues,
      performanceGains,
      compatibilityStatus,
      recommendations,
      readinessScore
    };
  }

  /**
   * Analyze phase results
   */
  private analyzePhaseResults(phases: PhaseResult[]): PhaseAnalysis[] {
    return phases.map(phase => {
      const criticalFindings = phase.findings
        .filter(f => f.impact === 'NEGATIVE')
        .map(f => f.description);

      const recommendations = phase.findings
        .filter(f => f.recommendation)
        .map(f => f.recommendation!)
        .filter(r => r);

      return {
        phase: phase.phase,
        status: phase.status,
        summary: this.generatePhaseSummary(phase),
        keyMetrics: phase.metrics,
        criticalFindings,
        recommendations
      };
    });
  }

  /**
   * Extract key findings
   */
  private extractKeyFindings(auditResult: AuditResult): KeyFinding[] {
    const keyFindings: KeyFinding[] = [];

    // Add critical issues as key findings
    for (const issue of auditResult.issues) {
      if (issue.severity === 'CRITICAL' || issue.severity === 'HIGH') {
        keyFindings.push({
          category: issue.type,
          impact: issue.severity as 'CRITICAL' | 'HIGH',
          description: issue.message,
          evidence: typeof issue.evidence === 'string' ? issue.evidence : JSON.stringify(issue.evidence),
          recommendation: issue.recommendation
        });
      }
    }

    // Add significant positive findings
    for (const phase of auditResult.phases) {
      for (const finding of phase.findings) {
        if (finding.impact === 'POSITIVE' && this.isSignificantFinding(finding)) {
          keyFindings.push({
            category: finding.category,
            impact: 'MEDIUM',
            description: finding.description,
            evidence: typeof finding.evidence === 'string' ? finding.evidence : JSON.stringify(finding.evidence),
            recommendation: finding.recommendation || 'Continue maintaining current practices'
          });
        }
      }
    }

    return keyFindings.slice(0, 10); // Top 10 key findings
  }

  /**
   * Generate performance metrics summary
   */
  private generatePerformanceMetrics(auditResult: AuditResult): PerformanceMetrics {
    const metrics = auditResult.metrics;

    return {
      bundleAnalysis: {
        currentSize: this.formatBytes(this.getBundleSize(auditResult)),
        reduction: `${metrics.bundleSizeReduction?.toFixed(1) || '0'}%`,
        targetMet: (metrics.bundleSizeReduction || 0) >= 13.5
      },
      apiPerformance: {
        averageResponseTime: `${this.getAverageResponseTime(auditResult)}ms`,
        improvement: `${metrics.responseTimeImprovement?.toFixed(1) || '0'}%`,
        targetMet: (metrics.responseTimeImprovement || 0) >= 24
      },
      memoryUsage: {
        currentUsage: this.formatBytes(this.getMemoryUsage(auditResult)),
        reduction: `${metrics.memoryReduction?.toFixed(1) || '0'}%`,
        targetMet: (metrics.memoryReduction || 0) >= 20
      }
    };
  }

  /**
   * Generate compatibility analysis
   */
  private generateCompatibilityAnalysis(auditResult: AuditResult): CompatibilityAnalysis {
    const compatibilityPhase = auditResult.phases.find(p => p.phase === 'COMPATIBILITY_VALIDATION');
    
    if (!compatibilityPhase) {
      return {
        backwardCompatibility: { status: 'Unknown', workingImports: 'N/A', issues: [] },
        apiContracts: { status: 'Unknown', validatedEndpoints: 'N/A', issues: [] },
        errorHandling: { status: 'Unknown', consistency: 'N/A', issues: [] }
      };
    }

    const metrics = compatibilityPhase.metrics;

    return {
      backwardCompatibility: {
        status: this.getCompatibilityStatus(metrics.workingImports, metrics.totalImports),
        workingImports: `${metrics.workingImports || 0}/${metrics.totalImports || 0}`,
        issues: this.extractCompatibilityIssues(compatibilityPhase, 'backward')
      },
      apiContracts: {
        status: this.getCompatibilityStatus(metrics.validatedEndpoints, metrics.totalEndpoints),
        validatedEndpoints: `${metrics.validatedEndpoints || 0}/${metrics.totalEndpoints || 0}`,
        issues: this.extractCompatibilityIssues(compatibilityPhase, 'contract')
      },
      errorHandling: {
        status: metrics.errorResponseIssues === 0 ? 'Consistent' : 'Needs Improvement',
        consistency: `${metrics.errorResponseIssues || 0} issues found`,
        issues: this.extractCompatibilityIssues(compatibilityPhase, 'error')
      }
    };
  }

  /**
   * Generate recommendations by category
   */
  private generateRecommendations(auditResult: AuditResult): RecommendationSection[] {
    const recommendations: RecommendationSection[] = [];

    // Performance recommendations
    if ((auditResult.metrics.bundleSizeReduction || 0) < 13.5) {
      recommendations.push({
        category: 'Performance Optimization',
        priority: 'HIGH',
        recommendations: [
          'Implement additional bundle optimization techniques',
          'Review and eliminate remaining duplicate code',
          'Optimize tree-shaking configuration'
        ],
        actionItems: [
          'Analyze webpack bundle composition',
          'Implement code splitting strategies',
          'Review and optimize import patterns'
        ]
      });
    }

    // Compatibility recommendations
    const compatibilityPhase = auditResult.phases.find(p => p.phase === 'COMPATIBILITY_VALIDATION');
    if (compatibilityPhase && compatibilityPhase.status !== AuditStatus.PASS) {
      recommendations.push({
        category: 'Compatibility & Integration',
        priority: 'HIGH',
        recommendations: [
          'Standardize API response formats across all endpoints',
          'Implement unified error handling system',
          'Complete migration to centralized authentication'
        ],
        actionItems: [
          'Update remaining API routes to use unified response system',
          'Implement consistent error message formatting',
          'Migrate all authentication to centralized system'
        ]
      });
    }

    // Integration recommendations
    const integrationPhase = auditResult.phases.find(p => p.phase === 'STATIC_ANALYSIS');
    if (integrationPhase && integrationPhase.status !== AuditStatus.PASS) {
      recommendations.push({
        category: 'System Integration',
        priority: 'MEDIUM',
        recommendations: [
          'Complete migration to unified utility functions',
          'Resolve remaining TypeScript compilation issues',
          'Standardize import patterns across codebase'
        ],
        actionItems: [
          'Update deprecated import statements',
          'Fix TypeScript type inconsistencies',
          'Implement consistent coding patterns'
        ]
      });
    }

    // Production readiness recommendations
    recommendations.push({
      category: 'Production Readiness',
      priority: 'MEDIUM',
      recommendations: [
        'Implement comprehensive monitoring and logging',
        'Set up automated performance regression testing',
        'Create deployment validation checklist'
      ],
      actionItems: [
        'Configure application performance monitoring',
        'Set up automated audit execution in CI/CD',
        'Create production deployment guidelines'
      ]
    });

    return recommendations;
  }

  /**
   * Generate conclusion
   */
  private generateConclusion(auditResult: AuditResult, summary: ExecutiveSummary): string {
    const statusText = auditResult.overall === AuditStatus.PASS ? 'successful' : 
                      auditResult.overall === AuditStatus.WARNING ? 'partially successful' : 'incomplete';

    const performanceText = summary.performanceGains.meetsAllTargets ? 
      'All performance targets have been achieved' :
      'Some performance targets need additional optimization';

    const compatibilityText = summary.compatibilityStatus === 'MAINTAINED' ?
      'Backward compatibility has been fully maintained' :
      'Some compatibility issues need to be addressed';

    return `
The system integration audit has been ${statusText}. ${performanceText}, and ${compatibilityText}.

The refactoring effort has established a solid foundation with unified utilities, centralized authentication, and consistent error handling. The audit reveals a readiness score of ${summary.readinessScore}%, indicating ${summary.readinessScore >= 90 ? 'excellent' : summary.readinessScore >= 75 ? 'good' : 'moderate'} system integration.

Key achievements include:
- Consolidated utility functions eliminating code duplication
- Unified API response system for consistent client interactions
- Centralized authentication and authorization mechanisms
- Optimized database query patterns and transaction handling

${summary.criticalIssues > 0 ? `Critical issues (${summary.criticalIssues}) must be addressed before production deployment.` : 'No critical issues were identified.'}

The system is ${summary.readinessScore >= 90 ? 'ready for production deployment' : summary.readinessScore >= 75 ? 'nearly ready for production with minor improvements' : 'requires additional work before production deployment'}.
    `.trim();
  }

  /**
   * Save reports in multiple formats
   */
  private async saveReports(detailedReport: DetailedReport, auditResult: AuditResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON report
    const jsonReport = {
      ...detailedReport,
      rawAuditResult: auditResult,
      generatedAt: new Date().toISOString()
    };
    
    await this.saveJsonReport(jsonReport, timestamp);
    
    // Save Markdown report
    await this.saveMarkdownReport(detailedReport, timestamp);
    
    // Save executive summary
    await this.saveExecutiveSummary(detailedReport.executiveSummary, timestamp);
    
    console.log(`📁 Reports saved to: ${this.outputPath}`);
  }

  /**
   * Save JSON report
   */
  private async saveJsonReport(report: any, timestamp: string): Promise<void> {
    const filePath = path.join(this.outputPath, `audit-report-${timestamp}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Save Markdown report
   */
  private async saveMarkdownReport(report: DetailedReport, timestamp: string): Promise<void> {
    const markdown = this.generateMarkdownReport(report);
    const filePath = path.join(this.outputPath, `audit-report-${timestamp}.md`);
    fs.writeFileSync(filePath, markdown);
  }

  /**
   * Save executive summary
   */
  private async saveExecutiveSummary(summary: ExecutiveSummary, timestamp: string): Promise<void> {
    const summaryText = this.generateExecutiveSummaryText(summary);
    const filePath = path.join(this.outputPath, `executive-summary-${timestamp}.md`);
    fs.writeFileSync(filePath, summaryText);
  }

  /**
   * Generate Markdown report
   */
  private generateMarkdownReport(report: DetailedReport): string {
    return `# System Integration & Consistency Audit Report

## Executive Summary

**Overall Status:** ${report.executiveSummary.overallStatus}  
**Readiness Score:** ${report.executiveSummary.readinessScore}%  
**Critical Issues:** ${report.executiveSummary.criticalIssues}  
**Warning Issues:** ${report.executiveSummary.warningIssues}  

### Performance Gains
- **Bundle Size Reduction:** ${report.executiveSummary.performanceGains.bundleSizeReduction.toFixed(1)}%
- **Response Time Improvement:** ${report.executiveSummary.performanceGains.responseTimeImprovement.toFixed(1)}%
- **Memory Reduction:** ${report.executiveSummary.performanceGains.memoryReduction.toFixed(1)}%
- **Meets All Targets:** ${report.executiveSummary.performanceGains.meetsAllTargets ? '✅ Yes' : '❌ No'}

### Compatibility Status
**${report.executiveSummary.compatibilityStatus}**

## Phase Results

${report.phaseResults.map(phase => `
### ${phase.phase}
**Status:** ${phase.status}  
**Summary:** ${phase.summary}

**Key Metrics:**
${Object.entries(phase.keyMetrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

${phase.criticalFindings.length > 0 ? `**Critical Findings:**
${phase.criticalFindings.map(f => `- ${f}`).join('\n')}` : ''}
`).join('\n')}

## Key Findings

${report.keyFindings.map(finding => `
### ${finding.category} (${finding.impact})
**Description:** ${finding.description}  
**Evidence:** ${finding.evidence}  
**Recommendation:** ${finding.recommendation}
`).join('\n')}

## Performance Metrics

### Bundle Analysis
- **Current Size:** ${report.performanceMetrics.bundleAnalysis.currentSize}
- **Reduction:** ${report.performanceMetrics.bundleAnalysis.reduction}
- **Target Met:** ${report.performanceMetrics.bundleAnalysis.targetMet ? '✅' : '❌'}

### API Performance
- **Average Response Time:** ${report.performanceMetrics.apiPerformance.averageResponseTime}
- **Improvement:** ${report.performanceMetrics.apiPerformance.improvement}
- **Target Met:** ${report.performanceMetrics.apiPerformance.targetMet ? '✅' : '❌'}

### Memory Usage
- **Current Usage:** ${report.performanceMetrics.memoryUsage.currentUsage}
- **Reduction:** ${report.performanceMetrics.memoryUsage.reduction}
- **Target Met:** ${report.performanceMetrics.memoryUsage.targetMet ? '✅' : '❌'}

## Compatibility Analysis

### Backward Compatibility
- **Status:** ${report.compatibilityAnalysis.backwardCompatibility.status}
- **Working Imports:** ${report.compatibilityAnalysis.backwardCompatibility.workingImports}

### API Contracts
- **Status:** ${report.compatibilityAnalysis.apiContracts.status}
- **Validated Endpoints:** ${report.compatibilityAnalysis.apiContracts.validatedEndpoints}

### Error Handling
- **Status:** ${report.compatibilityAnalysis.errorHandling.status}
- **Consistency:** ${report.compatibilityAnalysis.errorHandling.consistency}

## Recommendations

${report.recommendations.map(rec => `
### ${rec.category} (${rec.priority} Priority)

**Recommendations:**
${rec.recommendations.map(r => `- ${r}`).join('\n')}

**Action Items:**
${rec.actionItems.map(a => `- ${a}`).join('\n')}
`).join('\n')}

## Conclusion

${report.conclusion}

---
*Report generated on ${new Date().toISOString()}*
`;
  }

  /**
   * Generate executive summary text
   */
  private generateExecutiveSummaryText(summary: ExecutiveSummary): string {
    return `# Executive Summary - System Integration Audit

## Overall Assessment
- **Status:** ${summary.overallStatus}
- **Readiness Score:** ${summary.readinessScore}%
- **Critical Issues:** ${summary.criticalIssues}
- **Warning Issues:** ${summary.warningIssues}

## Performance Achievements
- **Bundle Size Reduction:** ${summary.performanceGains.bundleSizeReduction.toFixed(1)}% (Target: 13.5%)
- **Response Time Improvement:** ${summary.performanceGains.responseTimeImprovement.toFixed(1)}% (Target: 24%)
- **Memory Reduction:** ${summary.performanceGains.memoryReduction.toFixed(1)}% (Target: 20%)
- **All Targets Met:** ${summary.performanceGains.meetsAllTargets ? 'Yes' : 'No'}

## Compatibility Status
**${summary.compatibilityStatus}**

## Top Recommendations
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

## Deployment Readiness
${summary.readinessScore >= 90 ? '✅ Ready for production deployment' : 
  summary.readinessScore >= 75 ? '⚠️ Nearly ready - minor improvements needed' : 
  '❌ Requires additional work before deployment'}

---
*Generated on ${new Date().toISOString()}*
`;
  }

  // Helper methods

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
  }

  private checkPerformanceTargets(metrics: any): boolean {
    return (metrics.bundleSizeReduction || 0) >= 13.5 &&
           (metrics.responseTimeImprovement || 0) >= 24 &&
           (metrics.memoryReduction || 0) >= 20;
  }

  private determineCompatibilityStatus(auditResult: AuditResult): 'MAINTAINED' | 'PARTIAL' | 'BROKEN' {
    const compatibilityPhase = auditResult.phases.find(p => p.phase === 'COMPATIBILITY_VALIDATION');
    
    if (!compatibilityPhase) return 'PARTIAL';
    
    if (compatibilityPhase.status === AuditStatus.PASS) return 'MAINTAINED';
    if (compatibilityPhase.status === AuditStatus.WARNING) return 'PARTIAL';
    return 'BROKEN';
  }

  private calculateReadinessScore(auditResult: AuditResult, performance: PerformanceSummary, compatibility: string): number {
    let score = 0;
    
    // Overall status weight (40%)
    if (auditResult.overall === AuditStatus.PASS) score += 40;
    else if (auditResult.overall === AuditStatus.WARNING) score += 25;
    
    // Performance weight (30%)
    if (performance.meetsAllTargets) score += 30;
    else {
      const targetsMet = [
        performance.bundleSizeReduction >= 13.5,
        performance.responseTimeImprovement >= 24,
        performance.memoryReduction >= 20
      ].filter(Boolean).length;
      score += (targetsMet / 3) * 30;
    }
    
    // Compatibility weight (20%)
    if (compatibility === 'MAINTAINED') score += 20;
    else if (compatibility === 'PARTIAL') score += 10;
    
    // Issues weight (10%)
    const criticalIssues = auditResult.issues.filter(i => i.severity === 'CRITICAL').length;
    if (criticalIssues === 0) score += 10;
    else if (criticalIssues <= 2) score += 5;
    
    return Math.round(score);
  }

  private generateTopRecommendations(auditResult: AuditResult): string[] {
    const recommendations: string[] = [];
    
    if (auditResult.overall !== AuditStatus.PASS) {
      recommendations.push('Address critical and high-priority issues identified in the audit');
    }
    
    if ((auditResult.metrics.bundleSizeReduction || 0) < 13.5) {
      recommendations.push('Implement additional bundle optimization to meet size reduction targets');
    }
    
    const compatibilityPhase = auditResult.phases.find(p => p.phase === 'COMPATIBILITY_VALIDATION');
    if (compatibilityPhase && compatibilityPhase.status !== AuditStatus.PASS) {
      recommendations.push('Complete migration to unified API response and error handling systems');
    }
    
    recommendations.push('Implement continuous monitoring and automated audit execution');
    recommendations.push('Create comprehensive deployment validation checklist');
    
    return recommendations.slice(0, 5);
  }

  private generatePhaseSummary(phase: PhaseResult): string {
    const positiveFindings = phase.findings.filter(f => f.impact === 'POSITIVE').length;
    const negativeFindings = phase.findings.filter(f => f.impact === 'NEGATIVE').length;
    
    if (phase.status === AuditStatus.PASS) {
      return `Phase completed successfully with ${positiveFindings} positive findings and ${negativeFindings} issues.`;
    } else if (phase.status === AuditStatus.WARNING) {
      return `Phase completed with warnings. ${negativeFindings} issues need attention.`;
    } else {
      return `Phase failed with ${negativeFindings} critical issues that must be resolved.`;
    }
  }

  private isSignificantFinding(finding: Finding): boolean {
    const significantCategories = [
      'Bundle Size',
      'API Performance',
      'Memory Usage',
      'Type System Coherence',
      'Cross-Layer Integration'
    ];
    
    return significantCategories.includes(finding.category);
  }

  private getBundleSize(auditResult: AuditResult): number {
    const performancePhase = auditResult.phases.find(p => p.phase === 'PERFORMANCE_VALIDATION');
    return performancePhase?.metrics.bundleSize || 0;
  }

  private getAverageResponseTime(auditResult: AuditResult): number {
    const performancePhase = auditResult.phases.find(p => p.phase === 'PERFORMANCE_VALIDATION');
    return performancePhase?.metrics.averageResponseTime || 0;
  }

  private getMemoryUsage(auditResult: AuditResult): number {
    const performancePhase = auditResult.phases.find(p => p.phase === 'PERFORMANCE_VALIDATION');
    return performancePhase?.metrics.memoryUsage || 0;
  }

  private getCompatibilityStatus(working: number, total: number): string {
    if (!total) return 'Unknown';
    const percentage = (working / total) * 100;
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  private extractCompatibilityIssues(phase: PhaseResult, type: string): string[] {
    return phase.findings
      .filter(f => f.category.toLowerCase().includes(type) && f.impact === 'NEGATIVE')
      .map(f => f.description)
      .slice(0, 3);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}