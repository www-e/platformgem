// src/audit/types/index.ts
// Core TypeScript interfaces for the audit system

export enum AuditPhase {
  STATIC_ANALYSIS = 'STATIC_ANALYSIS',
  INTEGRATION_ANALYSIS = 'INTEGRATION_ANALYSIS',
  PERFORMANCE_VALIDATION = 'PERFORMANCE_VALIDATION',
  COMPATIBILITY_VALIDATION = 'COMPATIBILITY_VALIDATION'
}

export enum AuditStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  WARNING = 'WARNING',
  PENDING = 'PENDING'
}

export enum AuditErrorType {
  INTEGRATION_FAILURE = 'INTEGRATION_FAILURE',
  PERFORMANCE_REGRESSION = 'PERFORMANCE_REGRESSION',
  COMPATIBILITY_BREAK = 'COMPATIBILITY_BREAK',
  TYPE_SYSTEM_ERROR = 'TYPE_SYSTEM_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

export interface AuditConfig {
  phases: AuditPhase[];
  thresholds: PerformanceThresholds;
  compatibility: CompatibilityConfig;
  reporting: ReportingConfig;
}

export interface PerformanceThresholds {
  bundleSizeReductionMin: number; // 13.5%
  responseTimeImprovementMin: number; // 24%
  memoryReductionMin: number; // 20%
  compilationTimeImprovementMin: number; // 15%
}

export interface CompatibilityConfig {
  zeroBreakingChanges: boolean;
  backwardCompatibility: boolean;
  apiContractPreservation: boolean;
}

export interface ReportingConfig {
  generateExecutiveSummary: boolean;
  includeDetailedMetrics: boolean;
  outputFormat: 'JSON' | 'HTML' | 'MARKDOWN';
  outputPath: string;
}

export interface AuditResult {
  overall: AuditStatus;
  phases: PhaseResult[];
  metrics: AuditMetrics;
  issues: AuditIssue[];
  recommendations: string[];
  timestamp: string;
  duration: number;
}

export interface PhaseResult {
  phase: AuditPhase;
  status: AuditStatus;
  metrics: Record<string, number>;
  findings: Finding[];
  duration: number;
  startTime: string;
  endTime: string;
}

export interface AuditMetrics {
  bundleSizeReduction: number;
  responseTimeImprovement: number;
  memoryReduction: number;
  compilationTimeImprovement: number;
  duplicateCodeElimination: number;
  typeErrorCount: number;
  compatibilityIssues: number;
}

export interface AuditIssue {
  type: AuditErrorType;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  location: string;
  evidence: any;
  recommendation: string;
  phase: AuditPhase;
}

export interface Finding {
  category: string;
  description: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  evidence: any;
  recommendation?: string;
}

// Integration Analysis Types
export interface DependencyMap {
  apiToLib: Record<string, string[]>;
  libToLib: Record<string, string[]>;
  circularDependencies: string[];
  unusedExports: string[];
}

export interface IntegrationResult {
  crossLayerConsistency: boolean;
  authenticationIntegration: boolean;
  errorHandlingChain: boolean;
  typeSystemCoherence: boolean;
  issues: IntegrationIssue[];
}

export interface IntegrationIssue {
  type: 'MISSING_INTEGRATION' | 'DEPRECATED_IMPORT' | 'INCONSISTENT_INTERFACE';
  file: string;
  line?: number;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Performance Analysis Types
export interface BundleAnalysis {
  totalSize: number;
  sizeReduction: number;
  duplicateCode: number;
  treeShakingEfficiency: number;
  chunkAnalysis: ChunkAnalysis[];
}

export interface ChunkAnalysis {
  name: string;
  size: number;
  modules: string[];
}

export interface PerformanceMetrics {
  averageResponseTime: number;
  p95ResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
}

// Compatibility Analysis Types
export interface ContractValidationResult {
  endpoint: string;
  method: string;
  responseFormatMatch: boolean;
  statusCodeMatch: boolean;
  errorHandlingMatch: boolean;
  issues: ContractIssue[];
}

export interface ContractIssue {
  type: 'RESPONSE_FORMAT_CHANGE' | 'STATUS_CODE_CHANGE' | 'ERROR_FORMAT_CHANGE';
  description: string;
  expected: any;
  actual: any;
}

// Type System Analysis Types
export interface TypeCompilationResult {
  success: boolean;
  errorCount: number;
  warningCount: number;
  compilationTime: number;
  errors: TypeCompilationError[];
}

export interface TypeCompilationError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: number;
}

export interface ImportAnalysis {
  totalImports: number;
  deprecatedImports: number;
  unifiedImports: number;
  inconsistentImports: ImportInconsistency[];
}

export interface ImportInconsistency {
  file: string;
  line: number;
  importPath: string;
  issue: 'DEPRECATED_UTILITY' | 'INCONSISTENT_PATTERN' | 'MISSING_UNIFIED_IMPORT';
  recommendation: string;
}