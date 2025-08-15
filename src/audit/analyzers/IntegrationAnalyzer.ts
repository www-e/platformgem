// src/audit/analyzers/IntegrationAnalyzer.ts
// Comprehensive integration and type system validator

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { 
  IntegrationResult, 
  IntegrationIssue, 
  ImportAnalysis, 
  ImportInconsistency,
  TypeCompilationResult,
  TypeCompilationError,
  Finding
} from '../types';

export class IntegrationAnalyzer {
  private projectRoot: string;
  private srcPath: string;
  private libPath: string;
  private apiPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.srcPath = path.join(projectRoot, 'src');
    this.libPath = path.join(projectRoot, 'src', 'lib');
    this.apiPath = path.join(projectRoot, 'src', 'app', 'api');
  }

  /**
   * Run comprehensive integration analysis
   */
  async analyzeIntegration(): Promise<IntegrationResult> {
    console.log('🔍 Running integration and type system analysis...');

    const issues: IntegrationIssue[] = [];
    
    try {
      // 1. TypeScript compilation validation
      const compilationResult = await this.validateTypeScriptCompilation();
      if (!compilationResult.success) {
        issues.push({
          type: 'INCONSISTENT_INTERFACE',
          file: 'TypeScript Compilation',
          description: `TypeScript compilation failed with ${compilationResult.errorCount} errors`,
          severity: 'HIGH'
        });
      }

      // 2. Import consistency analysis
      const importAnalysis = await this.analyzeImportConsistency();
      issues.push(...this.convertImportInconsistenciesToIssues(importAnalysis.inconsistentImports));

      // 3. Cross-layer integration validation
      const crossLayerIssues = await this.validateCrossLayerIntegration();
      issues.push(...crossLayerIssues);

      // 4. Interface consistency validation
      const interfaceIssues = await this.validateInterfaceConsistency();
      issues.push(...interfaceIssues);

      const result: IntegrationResult = {
        crossLayerConsistency: crossLayerIssues.length === 0,
        authenticationIntegration: await this.validateAuthenticationIntegration(),
        errorHandlingChain: await this.validateErrorHandlingChain(),
        typeSystemCoherence: compilationResult.success && compilationResult.errorCount === 0,
        issues
      };

      console.log(`✅ Integration analysis completed. Found ${issues.length} issues.`);
      return result;

    } catch (error) {
      console.error('❌ Integration analysis failed:', error);
      issues.push({
        type: 'INCONSISTENT_INTERFACE',
        file: 'IntegrationAnalyzer',
        description: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'HIGH'
      });

      return {
        crossLayerConsistency: false,
        authenticationIntegration: false,
        errorHandlingChain: false,
        typeSystemCoherence: false,
        issues
      };
    }
  }

  /**
   * Validate TypeScript compilation
   */
  private async validateTypeScriptCompilation(): Promise<TypeCompilationResult> {
    console.log('  📋 Validating TypeScript compilation...');

    try {
      const configPath = path.join(this.projectRoot, 'tsconfig.json');
      
      if (!fs.existsSync(configPath)) {
        return {
          success: false,
          errorCount: 1,
          warningCount: 0,
          compilationTime: 0,
          errors: [{
            file: 'tsconfig.json',
            line: 0,
            column: 0,
            message: 'TypeScript configuration file not found',
            code: 0
          }]
        };
      }

      const startTime = Date.now();
      
      // Read TypeScript config
      const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
      if (configFile.error) {
        return {
          success: false,
          errorCount: 1,
          warningCount: 0,
          compilationTime: Date.now() - startTime,
          errors: [{
            file: configPath,
            line: 0,
            column: 0,
            message: configFile.error.messageText.toString(),
            code: configFile.error.code
          }]
        };
      }

      const parsedConfig = ts.parseJsonConfigFileContent(
        configFile.config,
        ts.sys,
        this.projectRoot
      );

      // Create TypeScript program
      const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
      
      // Get diagnostics
      const diagnostics = [
        ...program.getConfigFileParsingDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getSemanticDiagnostics()
      ];

      const errors: TypeCompilationError[] = diagnostics.map(diagnostic => {
        const file = diagnostic.file?.fileName || 'unknown';
        const position = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start || 0);
        
        return {
          file,
          line: position?.line || 0,
          column: position?.character || 0,
          message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          code: diagnostic.code
        };
      });

      const compilationTime = Date.now() - startTime;
      const errorCount = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error).length;
      const warningCount = diagnostics.filter(d => d.category === ts.DiagnosticCategory.Warning).length;

      console.log(`    ✅ TypeScript compilation: ${errorCount} errors, ${warningCount} warnings (${compilationTime}ms)`);

      return {
        success: errorCount === 0,
        errorCount,
        warningCount,
        compilationTime,
        errors
      };

    } catch (error) {
      console.error('    ❌ TypeScript compilation validation failed:', error);
      return {
        success: false,
        errorCount: 1,
        warningCount: 0,
        compilationTime: 0,
        errors: [{
          file: 'TypeScript Compiler',
          line: 0,
          column: 0,
          message: `Compilation validation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: 0
        }]
      };
    }
  }

  /**
   * Analyze import consistency across the codebase
   */
  private async analyzeImportConsistency(): Promise<ImportAnalysis> {
    console.log('  📋 Analyzing import consistency...');

    const inconsistentImports: ImportInconsistency[] = [];
    let totalImports = 0;
    let deprecatedImports = 0;
    let unifiedImports = 0;

    try {
      // Get all TypeScript files in API directory
      const apiFiles = this.getAllTsFiles(this.apiPath);
      
      for (const filePath of apiFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const imports = this.extractImports(fileContent);
        totalImports += imports.length;

        for (const importInfo of imports) {
          // Check for deprecated utility imports
          if (this.isDeprecatedUtilityImport(importInfo.path)) {
            deprecatedImports++;
            inconsistentImports.push({
              file: path.relative(this.projectRoot, filePath),
              line: importInfo.line,
              importPath: importInfo.path,
              issue: 'DEPRECATED_UTILITY',
              recommendation: `Use unified utilities from @/lib/core-utils or @/lib/api`
            });
          }
          
          // Check for unified imports
          if (this.isUnifiedImport(importInfo.path)) {
            unifiedImports++;
          }

          // Check for inconsistent patterns
          if (this.hasInconsistentPattern(importInfo.path)) {
            inconsistentImports.push({
              file: path.relative(this.projectRoot, filePath),
              line: importInfo.line,
              importPath: importInfo.path,
              issue: 'INCONSISTENT_PATTERN',
              recommendation: 'Use consistent import patterns from unified utilities'
            });
          }
        }
      }

      console.log(`    ✅ Import analysis: ${totalImports} total, ${deprecatedImports} deprecated, ${unifiedImports} unified`);

      return {
        totalImports,
        deprecatedImports,
        unifiedImports,
        inconsistentImports
      };

    } catch (error) {
      console.error('    ❌ Import consistency analysis failed:', error);
      return {
        totalImports: 0,
        deprecatedImports: 0,
        unifiedImports: 0,
        inconsistentImports: [{
          file: 'ImportAnalyzer',
          line: 0,
          importPath: '',
          issue: 'INCONSISTENT_PATTERN',
          recommendation: `Import analysis failed: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  /**
   * Validate cross-layer integration
   */
  private async validateCrossLayerIntegration(): Promise<IntegrationIssue[]> {
    console.log('  📋 Validating cross-layer integration...');

    const issues: IntegrationIssue[] = [];

    try {
      // Check if API routes use unified utilities
      const apiFiles = this.getAllTsFiles(this.apiPath);
      
      for (const filePath of apiFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        // Check for usage of unified API utilities
        if (!this.usesUnifiedApiUtilities(fileContent)) {
          issues.push({
            type: 'MISSING_INTEGRATION',
            file: path.relative(this.projectRoot, filePath),
            description: 'API route does not use unified utilities from @/lib/api',
            severity: 'MEDIUM'
          });
        }

        // Check for usage of unified response system
        if (!this.usesUnifiedResponseSystem(fileContent)) {
          issues.push({
            type: 'MISSING_INTEGRATION',
            file: path.relative(this.projectRoot, filePath),
            description: 'API route does not use unified response system',
            severity: 'MEDIUM'
          });
        }
      }

      console.log(`    ✅ Cross-layer integration: ${issues.length} issues found`);
      return issues;

    } catch (error) {
      console.error('    ❌ Cross-layer integration validation failed:', error);
      return [{
        type: 'MISSING_INTEGRATION',
        file: 'CrossLayerValidator',
        description: `Cross-layer validation failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'HIGH'
      }];
    }
  }

  /**
   * Validate interface consistency
   */
  private async validateInterfaceConsistency(): Promise<IntegrationIssue[]> {
    console.log('  📋 Validating interface consistency...');

    const issues: IntegrationIssue[] = [];

    try {
      // Check for duplicate interfaces
      const interfaceMap = new Map<string, string[]>();
      
      const allTsFiles = [
        ...this.getAllTsFiles(this.libPath),
        ...this.getAllTsFiles(this.apiPath)
      ];

      for (const filePath of allTsFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const interfaces = this.extractInterfaces(fileContent);
        
        for (const interfaceName of interfaces) {
          if (!interfaceMap.has(interfaceName)) {
            interfaceMap.set(interfaceName, []);
          }
          interfaceMap.get(interfaceName)!.push(path.relative(this.projectRoot, filePath));
        }
      }

      // Find duplicate interfaces
      interfaceMap.forEach((files, interfaceName) => {
        if (files.length > 1) {
          issues.push({
            type: 'INCONSISTENT_INTERFACE',
            file: files.join(', '),
            description: `Interface '${interfaceName}' is defined in multiple files`,
            severity: 'MEDIUM'
          });
        }
      });

      console.log(`    ✅ Interface consistency: ${issues.length} duplicate interfaces found`);
      return issues;

    } catch (error) {
      console.error('    ❌ Interface consistency validation failed:', error);
      return [{
        type: 'INCONSISTENT_INTERFACE',
        file: 'InterfaceValidator',
        description: `Interface validation failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'HIGH'
      }];
    }
  }

  /**
   * Validate authentication integration
   */
  private async validateAuthenticationIntegration(): Promise<boolean> {
    console.log('  📋 Validating authentication integration...');

    try {
      const apiFiles = this.getAllTsFiles(this.apiPath);
      let authIntegrationCount = 0;

      for (const filePath of apiFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        if (this.usesUnifiedAuthentication(fileContent)) {
          authIntegrationCount++;
        }
      }

      const hasGoodIntegration = authIntegrationCount > 0;
      console.log(`    ✅ Authentication integration: ${authIntegrationCount} files use unified auth`);
      return hasGoodIntegration;

    } catch (error) {
      console.error('    ❌ Authentication integration validation failed:', error);
      return false;
    }
  }

  /**
   * Validate error handling chain
   */
  private async validateErrorHandlingChain(): Promise<boolean> {
    console.log('  📋 Validating error handling chain...');

    try {
      const apiFiles = this.getAllTsFiles(this.apiPath);
      let errorHandlingCount = 0;

      for (const filePath of apiFiles) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        
        if (this.usesUnifiedErrorHandling(fileContent)) {
          errorHandlingCount++;
        }
      }

      const hasGoodErrorHandling = errorHandlingCount > 0;
      console.log(`    ✅ Error handling chain: ${errorHandlingCount} files use unified error handling`);
      return hasGoodErrorHandling;

    } catch (error) {
      console.error('    ❌ Error handling chain validation failed:', error);
      return false;
    }
  }

  // Helper methods

  private getAllTsFiles(directory: string): string[] {
    const files: string[] = [];
    
    if (!fs.existsSync(directory)) {
      return files;
    }

    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.getAllTsFiles(fullPath));
      } else if (item.endsWith('.ts') && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  private extractImports(content: string): Array<{path: string, line: number}> {
    const imports: Array<{path: string, line: number}> = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const importMatch = line.match(/import.*from\s+['"]([^'"]+)['"]/);
      
      if (importMatch) {
        imports.push({
          path: importMatch[1],
          line: i + 1
        });
      }
    }
    
    return imports;
  }

  private extractInterfaces(content: string): string[] {
    const interfaces: string[] = [];
    const interfaceMatches = content.match(/(?:export\s+)?interface\s+(\w+)/g);
    
    if (interfaceMatches) {
      for (const match of interfaceMatches) {
        const nameMatch = match.match(/interface\s+(\w+)/);
        if (nameMatch) {
          interfaces.push(nameMatch[1]);
        }
      }
    }
    
    return interfaces;
  }

  private isDeprecatedUtilityImport(importPath: string): boolean {
    const deprecatedPaths = [
      '@/lib/utils',
      '@/lib/shared-utils',
      '@/lib/analytics-utils',
      '@/lib/user-management-utils',
      '@/lib/api-error-handler'
    ];
    
    return deprecatedPaths.some(deprecated => importPath.includes(deprecated));
  }

  private isUnifiedImport(importPath: string): boolean {
    const unifiedPaths = [
      '@/lib/core-utils',
      '@/lib/api-response',
      '@/lib/api',
      '@/lib/types'
    ];
    
    return unifiedPaths.some(unified => importPath.includes(unified));
  }

  private hasInconsistentPattern(importPath: string): boolean {
    // Check for inconsistent import patterns
    return importPath.includes('../') && importPath.includes('lib/');
  }

  private usesUnifiedApiUtilities(content: string): boolean {
    return content.includes('@/lib/api') || 
           content.includes('createSuccessResponse') ||
           content.includes('createErrorResponse');
  }

  private usesUnifiedResponseSystem(content: string): boolean {
    return content.includes('createSuccessResponse') || 
           content.includes('createErrorResponse') ||
           content.includes('ApiResponse');
  }

  private usesUnifiedAuthentication(content: string): boolean {
    return content.includes('authenticateApiUser') ||
           content.includes('authenticateAdmin') ||
           content.includes('@/lib/api/auth');
  }

  private usesUnifiedErrorHandling(content: string): boolean {
    return content.includes('withErrorHandling') ||
           content.includes('createErrorResponse') ||
           content.includes('ApiErrors');
  }

  private convertImportInconsistenciesToIssues(inconsistencies: ImportInconsistency[]): IntegrationIssue[] {
    return inconsistencies.map(inconsistency => ({
      type: inconsistency.issue === 'DEPRECATED_UTILITY' ? 'DEPRECATED_IMPORT' : 'INCONSISTENT_INTERFACE',
      file: inconsistency.file,
      line: inconsistency.line,
      description: `${inconsistency.issue}: ${inconsistency.importPath}`,
      severity: inconsistency.issue === 'DEPRECATED_UTILITY' ? 'HIGH' : 'MEDIUM'
    }));
  }
}