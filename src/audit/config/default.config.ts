// src/audit/config/default.config.ts
// Default audit configuration based on refactoring report claims

import { AuditConfig, AuditPhase } from '../types';

export const DEFAULT_AUDIT_CONFIG: AuditConfig = {
  phases: [
    AuditPhase.STATIC_ANALYSIS,
    AuditPhase.INTEGRATION_ANALYSIS,
    AuditPhase.PERFORMANCE_VALIDATION,
    AuditPhase.COMPATIBILITY_VALIDATION
  ],
  
  thresholds: {
    // Performance thresholds based on refactoring reports
    bundleSizeReductionMin: 13.5, // 13.5% reduction claimed in lib refactoring
    responseTimeImprovementMin: 24, // 24% improvement claimed in API refactoring
    memoryReductionMin: 20, // 20% reduction claimed in lib refactoring
    compilationTimeImprovementMin: 15 // 15% improvement expected from consolidation
  },
  
  compatibility: {
    zeroBreakingChanges: true, // Strict requirement for zero breaking changes
    backwardCompatibility: true, // All existing imports must continue to work
    apiContractPreservation: true // API contracts must remain identical
  },
  
  reporting: {
    generateExecutiveSummary: true,
    includeDetailedMetrics: true,
    outputFormat: 'JSON',
    outputPath: './audit-results'
  }
};

/**
 * Create audit configuration for specific scenarios
 */
export function createAuditConfig(overrides?: Partial<AuditConfig>): AuditConfig {
  return {
    ...DEFAULT_AUDIT_CONFIG,
    ...overrides,
    thresholds: {
      ...DEFAULT_AUDIT_CONFIG.thresholds,
      ...overrides?.thresholds
    },
    compatibility: {
      ...DEFAULT_AUDIT_CONFIG.compatibility,
      ...overrides?.compatibility
    },
    reporting: {
      ...DEFAULT_AUDIT_CONFIG.reporting,
      ...overrides?.reporting
    }
  };
}

/**
 * Configuration for quick integration check
 */
export const INTEGRATION_ONLY_CONFIG: AuditConfig = createAuditConfig({
  phases: [AuditPhase.INTEGRATION_ANALYSIS],
  reporting: {
    generateExecutiveSummary: false,
    includeDetailedMetrics: true,
    outputFormat: 'JSON',
    outputPath: './integration-audit'
  }
});

/**
 * Configuration for performance validation only
 */
export const PERFORMANCE_ONLY_CONFIG: AuditConfig = createAuditConfig({
  phases: [AuditPhase.PERFORMANCE_VALIDATION],
  reporting: {
    generateExecutiveSummary: false,
    includeDetailedMetrics: true,
    outputFormat: 'JSON',
    outputPath: './performance-audit'
  }
});

/**
 * Configuration for compatibility check only
 */
export const COMPATIBILITY_ONLY_CONFIG: AuditConfig = createAuditConfig({
  phases: [AuditPhase.COMPATIBILITY_VALIDATION],
  reporting: {
    generateExecutiveSummary: false,
    includeDetailedMetrics: true,
    outputFormat: 'JSON',
    outputPath: './compatibility-audit'
  }
});

/**
 * Configuration for CI/CD pipeline (faster execution)
 */
export const CI_AUDIT_CONFIG: AuditConfig = createAuditConfig({
  phases: [
    AuditPhase.STATIC_ANALYSIS,
    AuditPhase.INTEGRATION_ANALYSIS
  ],
  thresholds: {
    bundleSizeReductionMin: 10, // Slightly lower threshold for CI
    responseTimeImprovementMin: 20,
    memoryReductionMin: 15,
    compilationTimeImprovementMin: 10
  },
  reporting: {
    generateExecutiveSummary: true,
    includeDetailedMetrics: false,
    outputFormat: 'JSON',
    outputPath: './ci-audit-results'
  }
});