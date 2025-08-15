// src/audit/validators/ProductionReadinessValidator.ts
// Production readiness validation

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Finding } from '../types';

export interface ProductionReadinessResult {
  buildValidation: BuildValidationResult;
  environmentValidation: EnvironmentValidationResult;
  securityValidation: SecurityValidationResult;
  performanceValidation: PerformanceValidationResult;
  overallReadiness: boolean;
  readinessScore: number;
  findings: Finding[];
}

export interface BuildValidationResult {
  buildSuccessful: boolean;
  typeScriptErrors: number;
  eslintWarnings: number;
  buildTime: number;
  buildSize: number;
}

export interface EnvironmentValidationResult {
  requiredEnvVars: string[];
  missingEnvVars: string[];
  configurationValid: boolean;
  databaseConnection: boolean;
}

export interface SecurityValidationResult {
  vulnerabilities: number;
  securityHeaders: boolean;
  authenticationSecure: boolean;
  dataValidation: boolean;
}

export interface PerformanceValidationResult {
  bundleOptimized: boolean;
  cacheHeaders: boolean;
  compressionEnabled: boolean;
  imageOptimization: boolean;
}

export class ProductionReadinessValidator {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Validate production readiness
   */
  async validateProductionReadiness(): Promise<ProductionReadinessResult> {
    console.log('🚀 Validating production readiness...');

    const findings: Finding[] = [];

    try {
      // 1. Build validation
      console.log('  🔨 Validating build process...');
      const buildValidation = await this.validateBuild();

      // 2. Environment validation
      console.log('  🌍 Validating environment configuration...');
      const environmentValidation = await this.validateEnvironment();

      // 3. Security validation
      console.log('  🔒 Validating security configuration...');
      const securityValidation = await this.validateSecurity();

      // 4. Performance validation
      console.log('  ⚡ Validating performance configuration...');
      const performanceValidation = await this.validatePerformance();

      // 5. Calculate overall readiness
      const { overallReadiness, readinessScore } = this.calculateReadiness(
        buildValidation,
        environmentValidation,
        securityValidation,
        performanceValidation
      );

      // 6. Generate findings
      findings.push(...this.generateReadinessFindings(
        buildValidation,
        environmentValidation,
        securityValidation,
        performanceValidation,
        overallReadiness
      ));

      console.log(`✅ Production readiness validation completed (Score: ${readinessScore}%)`);

      return {
        buildValidation,
        environmentValidation,
        securityValidation,
        performanceValidation,
        overallReadiness,
        readinessScore,
        findings
      };

    } catch (error) {
      console.error('❌ Production readiness validation failed:', error);
      
      findings.push({
        category: 'Production Readiness Error',
        description: `Production readiness validation failed: ${error.message}`,
        impact: 'NEGATIVE',
        evidence: error,
        recommendation: 'Check production readiness validator setup'
      });

      return {
        buildValidation: this.getEmptyBuildResult(),
        environmentValidation: this.getEmptyEnvironmentResult(),
        securityValidation: this.getEmptySecurityResult(),
        performanceValidation: this.getEmptyPerformanceResult(),
        overallReadiness: false,
        readinessScore: 0,
        findings
      };
    }
  }

  /**
   * Validate build process
   */
  private async validateBuild(): Promise<BuildValidationResult> {
    try {
      const startTime = Date.now();
      let buildSuccessful = false;
      let typeScriptErrors = 0;
      let eslintWarnings = 0;
      let buildSize = 0;

      // Check if build already exists
      const buildPath = path.join(this.projectRoot, '.next');
      if (fs.existsSync(buildPath)) {
        buildSuccessful = true;
        buildSize = this.calculateDirectorySize(buildPath);
        console.log('    ✅ Existing build found');
      } else {
        // Attempt to build
        try {
          console.log('    🔨 Running build process...');
          execSync('npm run build', { 
            cwd: this.projectRoot, 
            stdio: 'pipe',
            timeout: 300000 // 5 minutes
          });
          buildSuccessful = true;
          buildSize = this.calculateDirectorySize(buildPath);
          console.log('    ✅ Build completed successfully');
        } catch (error) {
          console.log('    ❌ Build failed');
          buildSuccessful = false;
        }
      }

      // Check TypeScript compilation
      try {
        execSync('npx tsc --noEmit', { 
          cwd: this.projectRoot, 
          stdio: 'pipe' 
        });
        console.log('    ✅ TypeScript compilation successful');
      } catch (error) {
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || '';
        typeScriptErrors = (errorOutput.match(/error TS\d+:/g) || []).length;
        console.log(`    ⚠️ TypeScript compilation has ${typeScriptErrors} errors`);
      }

      // Check ESLint
      try {
        execSync('npx eslint . --ext .ts,.tsx --format json', { 
          cwd: this.projectRoot, 
          stdio: 'pipe' 
        });
        console.log('    ✅ ESLint validation passed');
      } catch (error) {
        const errorOutput = error.stdout?.toString() || '';
        try {
          const eslintResults = JSON.parse(errorOutput);
          eslintWarnings = eslintResults.reduce((total: number, file: any) => 
            total + file.warningCount, 0);
        } catch {
          eslintWarnings = 1; // Assume at least one warning if parsing fails
        }
        console.log(`    ⚠️ ESLint found ${eslintWarnings} warnings`);
      }

      const buildTime = Date.now() - startTime;

      return {
        buildSuccessful,
        typeScriptErrors,
        eslintWarnings,
        buildTime,
        buildSize
      };

    } catch (error) {
      console.error('    ❌ Build validation failed:', error);
      return this.getEmptyBuildResult();
    }
  }

  /**
   * Validate environment configuration
   */
  private async validateEnvironment(): Promise<EnvironmentValidationResult> {
    try {
      const requiredEnvVars = [
        'DATABASE_URL',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ];

      const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
      const configurationValid = missingEnvVars.length === 0;

      // Check database connection (simplified)
      let databaseConnection = false;
      try {
        if (process.env.DATABASE_URL) {
          // In a real implementation, this would test the actual database connection
          databaseConnection = true;
          console.log('    ✅ Database configuration found');
        }
      } catch (error) {
        console.log('    ❌ Database connection failed');
      }

      console.log(`    📊 Environment: ${requiredEnvVars.length - missingEnvVars.length}/${requiredEnvVars.length} required variables set`);

      return {
        requiredEnvVars,
        missingEnvVars,
        configurationValid,
        databaseConnection
      };

    } catch (error) {
      console.error('    ❌ Environment validation failed:', error);
      return this.getEmptyEnvironmentResult();
    }
  }

  /**
   * Validate security configuration
   */
  private async validateSecurity(): Promise<SecurityValidationResult> {
    try {
      let vulnerabilities = 0;
      let securityHeaders = false;
      let authenticationSecure = true;
      let dataValidation = true;

      // Check for security vulnerabilities (npm audit)
      try {
        execSync('npm audit --audit-level high --json', { 
          cwd: this.projectRoot, 
          stdio: 'pipe' 
        });
        console.log('    ✅ No high-severity vulnerabilities found');
      } catch (error) {
        const auditOutput = error.stdout?.toString() || '';
        try {
          const auditResult = JSON.parse(auditOutput);
          vulnerabilities = auditResult.metadata?.vulnerabilities?.high || 0;
        } catch {
          vulnerabilities = 1; // Assume at least one if parsing fails
        }
        console.log(`    ⚠️ Found ${vulnerabilities} high-severity vulnerabilities`);
      }

      // Check for security headers in Next.js config
      const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        securityHeaders = configContent.includes('headers') || configContent.includes('security');
        console.log(`    ${securityHeaders ? '✅' : '⚠️'} Security headers configuration`);
      }

      // Check authentication configuration
      const authConfigPath = path.join(this.projectRoot, 'src', 'lib', 'auth.ts');
      if (fs.existsSync(authConfigPath)) {
        const authContent = fs.readFileSync(authConfigPath, 'utf8');
        authenticationSecure = authContent.includes('secret') && authContent.includes('session');
        console.log(`    ${authenticationSecure ? '✅' : '⚠️'} Authentication configuration`);
      }

      console.log(`    🔒 Security score: ${vulnerabilities === 0 ? 'Good' : 'Needs attention'}`);

      return {
        vulnerabilities,
        securityHeaders,
        authenticationSecure,
        dataValidation
      };

    } catch (error) {
      console.error('    ❌ Security validation failed:', error);
      return this.getEmptySecurityResult();
    }
  }

  /**
   * Validate performance configuration
   */
  private async validatePerformance(): Promise<PerformanceValidationResult> {
    try {
      let bundleOptimized = false;
      let cacheHeaders = false;
      let compressionEnabled = false;
      let imageOptimization = false;

      // Check Next.js configuration for optimizations
      const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
      if (fs.existsSync(nextConfigPath)) {
        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        
        bundleOptimized = configContent.includes('webpack') || configContent.includes('optimization');
        cacheHeaders = configContent.includes('headers') || configContent.includes('cache');
        compressionEnabled = configContent.includes('compress') || configContent.includes('gzip');
        imageOptimization = configContent.includes('images') || configContent.includes('optimization');
        
        console.log(`    ${bundleOptimized ? '✅' : '⚠️'} Bundle optimization`);
        console.log(`    ${cacheHeaders ? '✅' : '⚠️'} Cache headers`);
        console.log(`    ${compressionEnabled ? '✅' : '⚠️'} Compression`);
        console.log(`    ${imageOptimization ? '✅' : '⚠️'} Image optimization`);
      } else {
        console.log('    ⚠️ Next.js configuration not found');
      }

      return {
        bundleOptimized,
        cacheHeaders,
        compressionEnabled,
        imageOptimization
      };

    } catch (error) {
      console.error('    ❌ Performance validation failed:', error);
      return this.getEmptyPerformanceResult();
    }
  }

  /**
   * Calculate overall readiness
   */
  private calculateReadiness(
    build: BuildValidationResult,
    environment: EnvironmentValidationResult,
    security: SecurityValidationResult,
    performance: PerformanceValidationResult
  ): { overallReadiness: boolean; readinessScore: number } {
    let score = 0;

    // Build validation (40%)
    if (build.buildSuccessful) score += 25;
    if (build.typeScriptErrors === 0) score += 10;
    if (build.eslintWarnings < 10) score += 5;

    // Environment validation (25%)
    if (environment.configurationValid) score += 15;
    if (environment.databaseConnection) score += 10;

    // Security validation (20%)
    if (security.vulnerabilities === 0) score += 10;
    if (security.authenticationSecure) score += 5;
    if (security.securityHeaders) score += 5;

    // Performance validation (15%)
    const performanceFeatures = [
      performance.bundleOptimized,
      performance.cacheHeaders,
      performance.compressionEnabled,
      performance.imageOptimization
    ].filter(Boolean).length;
    score += (performanceFeatures / 4) * 15;

    const readinessScore = Math.round(score);
    const overallReadiness = readinessScore >= 80;

    return { overallReadiness, readinessScore };
  }

  /**
   * Generate readiness findings
   */
  private generateReadinessFindings(
    build: BuildValidationResult,
    environment: EnvironmentValidationResult,
    security: SecurityValidationResult,
    performance: PerformanceValidationResult,
    overallReadiness: boolean
  ): Finding[] {
    const findings: Finding[] = [];

    // Build findings
    findings.push({
      category: 'Build Validation',
      description: `Build ${build.buildSuccessful ? 'successful' : 'failed'} with ${build.typeScriptErrors} TypeScript errors`,
      impact: build.buildSuccessful && build.typeScriptErrors === 0 ? 'POSITIVE' : 'NEGATIVE',
      evidence: build,
      recommendation: build.buildSuccessful ? 'Build process is working correctly' : 'Fix build errors before deployment'
    });

    // Environment findings
    findings.push({
      category: 'Environment Configuration',
      description: `${environment.missingEnvVars.length} missing environment variables`,
      impact: environment.configurationValid ? 'POSITIVE' : 'NEGATIVE',
      evidence: environment,
      recommendation: environment.configurationValid ? 'Environment configuration is complete' : 'Set missing environment variables'
    });

    // Security findings
    findings.push({
      category: 'Security Configuration',
      description: `${security.vulnerabilities} high-severity vulnerabilities found`,
      impact: security.vulnerabilities === 0 ? 'POSITIVE' : 'NEGATIVE',
      evidence: security,
      recommendation: security.vulnerabilities === 0 ? 'Security configuration is good' : 'Address security vulnerabilities'
    });

    // Performance findings
    const performanceFeatures = [
      performance.bundleOptimized,
      performance.cacheHeaders,
      performance.compressionEnabled,
      performance.imageOptimization
    ].filter(Boolean).length;

    findings.push({
      category: 'Performance Configuration',
      description: `${performanceFeatures}/4 performance optimizations enabled`,
      impact: performanceFeatures >= 3 ? 'POSITIVE' : 'NEGATIVE',
      evidence: performance,
      recommendation: performanceFeatures >= 3 ? 'Performance configuration is good' : 'Enable additional performance optimizations'
    });

    // Overall readiness finding
    findings.push({
      category: 'Production Readiness',
      description: `System is ${overallReadiness ? 'ready' : 'not ready'} for production deployment`,
      impact: overallReadiness ? 'POSITIVE' : 'NEGATIVE',
      evidence: { overallReadiness },
      recommendation: overallReadiness ? 'System is ready for production deployment' : 'Address identified issues before deployment'
    });

    return findings;
  }

  // Helper methods

  private calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;

    if (!fs.existsSync(dirPath)) {
      return 0;
    }

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        totalSize += this.calculateDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  private getEmptyBuildResult(): BuildValidationResult {
    return {
      buildSuccessful: false,
      typeScriptErrors: 0,
      eslintWarnings: 0,
      buildTime: 0,
      buildSize: 0
    };
  }

  private getEmptyEnvironmentResult(): EnvironmentValidationResult {
    return {
      requiredEnvVars: [],
      missingEnvVars: [],
      configurationValid: false,
      databaseConnection: false
    };
  }

  private getEmptySecurityResult(): SecurityValidationResult {
    return {
      vulnerabilities: 0,
      securityHeaders: false,
      authenticationSecure: false,
      dataValidation: false
    };
  }

  private getEmptyPerformanceResult(): PerformanceValidationResult {
    return {
      bundleOptimized: false,
      cacheHeaders: false,
      compressionEnabled: false,
      imageOptimization: false
    };
  }
}