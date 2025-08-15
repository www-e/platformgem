// src/audit/index.ts
// Main entry point for the audit system

export * from './types';
export * from './core/AuditController';
export * from './config/default.config';

// Re-export key classes and functions for easy access
export { AuditController } from './core/AuditController';
export { 
  DEFAULT_AUDIT_CONFIG,
  INTEGRATION_ONLY_CONFIG,
  PERFORMANCE_ONLY_CONFIG,
  COMPATIBILITY_ONLY_CONFIG,
  CI_AUDIT_CONFIG,
  createAuditConfig
} from './config/default.config';

// Version information
export const AUDIT_SYSTEM_VERSION = '1.0.0';
export const AUDIT_SYSTEM_NAME = 'System Integration & Consistency Audit';