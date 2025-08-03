/**
 * Comprehensive validation system for static index fund data
 * Ensures data integrity, type safety, and business logic compliance
 */

import type { IndexFund } from '@/lib/types/indexFunds';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: ValidationSummary;
}

export interface ValidationError {
  type: 'SCHEMA' | 'TYPE' | 'BUSINESS' | 'INTEGRITY';
  field: string;
  message: string;
  fundSymbol?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface ValidationWarning {
  type: 'FORMAT' | 'RECOMMENDATION' | 'PERFORMANCE';
  field: string;
  message: string;
  fundSymbol?: string;
}

export interface ValidationSummary {
  totalFunds: number;
  validFunds: number;
  invalidFunds: number;
  criticalErrors: number;
  highErrors: number;
  mediumErrors: number;
  warnings: number;
  coverageMetrics: {
    categoryCoverage: number;
    providerCoverage: number;
    educationalTagCoverage: number;
  };
}

/**
 * Main validation function for index fund data
 */
export function validateIndexFundData(funds: IndexFund[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Schema validation
  const schemaResults = validateSchema(funds);
  errors.push(...schemaResults.errors);
  warnings.push(...schemaResults.warnings);
  
  // Type safety validation
  const typeResults = validateTypes(funds);
  errors.push(...typeResults.errors);
  warnings.push(...typeResults.warnings);
  
  // Business logic validation
  const businessResults = validateBusinessLogic(funds);
  errors.push(...businessResults.errors);
  warnings.push(...businessResults.warnings);
  
  // Data integrity validation
  const integrityResults = validateDataIntegrity(funds);
  errors.push(...integrityResults.errors);
  warnings.push(...integrityResults.warnings);
  
  // Generate summary
  const summary = generateValidationSummary(funds, errors, warnings);
  
  return {
    isValid: errors.filter(e => e.severity === 'CRITICAL').length === 0,
    errors,
    warnings,
    summary
  };
}

/**
 * Validate JSON schema and required fields
 */
function validateSchema(funds: IndexFund[]): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  if (!Array.isArray(funds)) {
    errors.push({
      type: 'SCHEMA',
      field: 'root',
      message: 'Data must be an array of fund objects',
      severity: 'CRITICAL'
    });
    return { errors, warnings };
  }
  
  funds.forEach((fund, index) => {
    const fundRef = fund?.symbol || `index-${index}`;
    
    // Required fields validation
    const requiredFields = ['symbol', 'name', 'category', 'provider', 'expenseRatio', 'description', 'keyFacts'];
    requiredFields.forEach(field => {
      if (!(field in fund) || fund[field as keyof IndexFund] === undefined || fund[field as keyof IndexFund] === null) {
        errors.push({
          type: 'SCHEMA',
          field,
          message: `Required field '${field}' is missing or null`,
          fundSymbol: fundRef,
          severity: 'CRITICAL'
        });
      }
    });
    
    // Optional fields validation
    if ('educationalTags' in fund && fund.educationalTags !== undefined) {
      if (!Array.isArray(fund.educationalTags)) {
        errors.push({
          type: 'SCHEMA',
          field: 'educationalTags',
          message: 'educationalTags must be an array',
          fundSymbol: fundRef,
          severity: 'HIGH'
        });
      }
    }
    
    if ('isEducational' in fund && fund.isEducational !== undefined) {
      if (typeof fund.isEducational !== 'boolean') {
        errors.push({
          type: 'SCHEMA',
          field: 'isEducational',
          message: 'isEducational must be a boolean',
          fundSymbol: fundRef,
          severity: 'MEDIUM'
        });
      }
    }
  });
  
  return { errors, warnings };
}

/**
 * Validate TypeScript type compliance
 */
function validateTypes(funds: IndexFund[]): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Valid enum values (based on actual data)
  const validCategories = [
    'Total Market', 'Large Cap', 'International', 'Small Cap', 
    'Bonds', 'Growth', 'Growth/Technology'
  ];
  
  const validProviders = ['Vanguard', 'Fidelity', 'SPDR', 'Schwab', 'Invesco'];
  
  const validEducationalTags = [
    'beginner-friendly', 'low-cost', 'diversification', 'total-market',
    'sp500', 'large-cap', 'blue-chip', 'international', 'emerging-markets',
    'global', 'small-cap', 'growth', 'growth-potential', 'technology',
    'innovation', 'nasdaq', 'bonds', 'fixed-income', 'stability',
    'ultra-low-cost', 'zero-cost', 'mutual-fund', 'performance', 'liquid',
    'oldest-etf', 'revolutionary', 'volatility', 'fidelity', 'schwab'
  ];
  
  funds.forEach(fund => {
    if (!fund?.symbol) return; // Skip if no symbol (caught in schema validation)
    
    // Symbol validation
    if (typeof fund.symbol !== 'string' || fund.symbol.length === 0) {
      errors.push({
        type: 'TYPE',
        field: 'symbol',
        message: 'Symbol must be a non-empty string',
        fundSymbol: fund.symbol,
        severity: 'CRITICAL'
      });
    } else if (!/^[A-Z]{2,5}$/.test(fund.symbol)) {
      warnings.push({
        type: 'FORMAT',
        field: 'symbol',
        message: 'Symbol should be 2-5 uppercase letters',
        fundSymbol: fund.symbol
      });
    }
    
    // Name validation
    if (typeof fund.name !== 'string' || fund.name.length === 0) {
      errors.push({
        type: 'TYPE',
        field: 'name',
        message: 'Name must be a non-empty string',
        fundSymbol: fund.symbol,
        severity: 'CRITICAL'
      });
    }
    
    // Category validation
    if (!validCategories.includes(fund.category)) {
      errors.push({
        type: 'TYPE',
        field: 'category',
        message: `Category must be one of: ${validCategories.join(', ')}`,
        fundSymbol: fund.symbol,
        severity: 'HIGH'
      });
    }
    
    // Provider validation
    if (!validProviders.includes(fund.provider)) {
      errors.push({
        type: 'TYPE',
        field: 'provider',
        message: `Provider must be one of: ${validProviders.join(', ')}`,
        fundSymbol: fund.symbol,
        severity: 'HIGH'
      });
    }
    
    // Expense ratio validation
    if (typeof fund.expenseRatio !== 'number') {
      errors.push({
        type: 'TYPE',
        field: 'expenseRatio',
        message: 'Expense ratio must be a number',
        fundSymbol: fund.symbol,
        severity: 'CRITICAL'
      });
    } else if (fund.expenseRatio < 0 || fund.expenseRatio > 3) {
      errors.push({
        type: 'TYPE',
        field: 'expenseRatio',
        message: 'Expense ratio must be between 0 and 3 percent',
        fundSymbol: fund.symbol,
        severity: 'HIGH'
      });
    }
    
    // Description validation
    if (typeof fund.description !== 'string' || fund.description.length === 0) {
      errors.push({
        type: 'TYPE',
        field: 'description',
        message: 'Description must be a non-empty string',
        fundSymbol: fund.symbol,
        severity: 'MEDIUM'
      });
    } else if (fund.description.length < 10) {
      warnings.push({
        type: 'RECOMMENDATION',
        field: 'description',
        message: 'Description should be at least 10 characters long',
        fundSymbol: fund.symbol
      });
    }
    
    // Key facts validation
    if (!Array.isArray(fund.keyFacts)) {
      errors.push({
        type: 'TYPE',
        field: 'keyFacts',
        message: 'keyFacts must be an array',
        fundSymbol: fund.symbol,
        severity: 'CRITICAL'
      });
    } else {
      if (fund.keyFacts.length === 0) {
        warnings.push({
          type: 'RECOMMENDATION',
          field: 'keyFacts',
          message: 'keyFacts should contain at least one fact',
          fundSymbol: fund.symbol
        });
      }
      
      fund.keyFacts.forEach((fact, index) => {
        if (typeof fact !== 'string' || fact.length === 0) {
          errors.push({
            type: 'TYPE',
            field: `keyFacts[${index}]`,
            message: 'Each key fact must be a non-empty string',
            fundSymbol: fund.symbol,
            severity: 'MEDIUM'
          });
        }
      });
    }
    
    // Educational tags validation (optional field)
    if ('educationalTags' in fund && fund.educationalTags) {
      fund.educationalTags.forEach((tag, index) => {
        if (!validEducationalTags.includes(tag)) {
          errors.push({
            type: 'TYPE',
            field: `educationalTags[${index}]`,
            message: `Educational tag must be one of: ${validEducationalTags.join(', ')}`,
            fundSymbol: fund.symbol,
            severity: 'MEDIUM'
          });
        }
      });
    }
  });
  
  return { errors, warnings };
}

/**
 * Validate business logic and relationships
 */
function validateBusinessLogic(funds: IndexFund[]): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Check for duplicate symbols
  const symbols = new Set<string>();
  funds.forEach(fund => {
    if (!fund?.symbol) return;
    
    if (symbols.has(fund.symbol)) {
      errors.push({
        type: 'BUSINESS',
        field: 'symbol',
        message: 'Duplicate symbol found',
        fundSymbol: fund.symbol,
        severity: 'CRITICAL'
      });
    }
    symbols.add(fund.symbol);
  });
  
  // Educational logic validation
  funds.forEach(fund => {
    if (!fund?.symbol) return;
    
    // If marked as educational, should have educational tags
    if (fund.isEducational && (!fund.educationalTags || fund.educationalTags.length === 0)) {
      warnings.push({
        type: 'RECOMMENDATION',
        field: 'educationalTags',
        message: 'Educational funds should have educational tags',
        fundSymbol: fund.symbol
      });
    }
    
    // Low-cost funds should be marked as educational
    if (fund.expenseRatio <= 0.05 && !fund.isEducational) {
      warnings.push({
        type: 'RECOMMENDATION',
        field: 'isEducational',
        message: 'Ultra-low-cost funds should be marked as educational',
        fundSymbol: fund.symbol
      });
    }
    
    // Broad market funds should be beginner-friendly
    if ((fund.category === 'Total Market' || fund.educationalTags?.includes('sp500')) && 
        fund.educationalTags && !fund.educationalTags.includes('beginner-friendly')) {
      warnings.push({
        type: 'RECOMMENDATION',
        field: 'educationalTags',
        message: 'Broad market funds should include "beginner-friendly" tag',
        fundSymbol: fund.symbol
      });
    }
  });
  
  return { errors, warnings };
}

/**
 * Validate overall data integrity and coverage
 */
function validateDataIntegrity(funds: IndexFund[]): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Minimum fund count
  if (funds.length < 5) {
    warnings.push({
      type: 'RECOMMENDATION',
      field: 'total',
      message: 'Should have at least 5 funds for good diversity',
      fundSymbol: 'N/A'
    });
  }
  
  // Category coverage
  const categories = new Set(funds.map(f => f.category));
  const requiredCategories = ['Large Cap', 'Total Market'];
  requiredCategories.forEach(cat => {
    if (!categories.has(cat)) {
      warnings.push({
        type: 'RECOMMENDATION',
        field: 'category',
        message: `Missing important category: ${cat}`,
        fundSymbol: 'N/A'
      });
    }
  });
  
  // Provider diversity
  const providers = new Set(funds.map(f => f.provider));
  if (providers.size < 2) {
    warnings.push({
      type: 'RECOMMENDATION',
      field: 'provider',
      message: 'Should have funds from multiple providers for comparison',
      fundSymbol: 'N/A'
    });
  }
  
  // Educational fund coverage
  const educationalFunds = funds.filter(f => f.isEducational);
  if (educationalFunds.length < 3) {
    warnings.push({
      type: 'RECOMMENDATION',
      field: 'isEducational',
      message: 'Should have at least 3 educational funds for beginner guidance',
      fundSymbol: 'N/A'
    });
  }
  
  return { errors, warnings };
}

/**
 * Generate comprehensive validation summary
 */
function generateValidationSummary(
  funds: IndexFund[], 
  errors: ValidationError[], 
  warnings: ValidationWarning[]
): ValidationSummary {
  const criticalErrors = errors.filter(e => e.severity === 'CRITICAL').length;
  const highErrors = errors.filter(e => e.severity === 'HIGH').length;
  const mediumErrors = errors.filter(e => e.severity === 'MEDIUM').length;
  
  const fundsWithErrors = new Set(
    errors.filter(e => e.fundSymbol && e.fundSymbol !== 'N/A').map(e => e.fundSymbol!)
  );
  
  const categories = new Set(funds.map(f => f.category));
  const providers = new Set(funds.map(f => f.provider));
  const educationalTags = new Set(
    funds.flatMap(f => f.educationalTags || [])
  );
  
  return {
    totalFunds: funds.length,
    validFunds: funds.length - fundsWithErrors.size,
    invalidFunds: fundsWithErrors.size,
    criticalErrors,
    highErrors,
    mediumErrors,
    warnings: warnings.length,
    coverageMetrics: {
      categoryCoverage: categories.size,
      providerCoverage: providers.size,
      educationalTagCoverage: educationalTags.size
    }
  };
}

/**
 * Format validation results for human reading
 */
export function formatValidationReport(result: ValidationResult): string {
  const { summary, errors, warnings } = result;
  
  let report = `\n=== INDEX FUND DATA VALIDATION REPORT ===\n\n`;
  
  // Summary
  report += `📊 SUMMARY:\n`;
  report += `  Total Funds: ${summary.totalFunds}\n`;
  report += `  Valid Funds: ${summary.validFunds}\n`;
  report += `  Invalid Funds: ${summary.invalidFunds}\n`;
  report += `  Overall Status: ${result.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;
  
  // Error breakdown
  report += `🚨 ERRORS:\n`;
  report += `  Critical: ${summary.criticalErrors}\n`;
  report += `  High: ${summary.highErrors}\n`;
  report += `  Medium: ${summary.mediumErrors}\n`;
  report += `  Warnings: ${summary.warnings}\n\n`;
  
  // Coverage metrics
  report += `📈 COVERAGE METRICS:\n`;
  report += `  Categories: ${summary.coverageMetrics.categoryCoverage}\n`;
  report += `  Providers: ${summary.coverageMetrics.providerCoverage}\n`;
  report += `  Educational Tags: ${summary.coverageMetrics.educationalTagCoverage}\n\n`;
  
  // Detailed errors
  if (errors.length > 0) {
    report += `🔍 DETAILED ERRORS:\n`;
    errors.forEach(error => {
      const severity = error.severity === 'CRITICAL' ? '🚨' : 
                     error.severity === 'HIGH' ? '⚠️' : '⚡';
      report += `  ${severity} [${error.type}] ${error.fundSymbol || 'GLOBAL'}: ${error.field} - ${error.message}\n`;
    });
    report += `\n`;
  }
  
  // Detailed warnings
  if (warnings.length > 0) {
    report += `💡 RECOMMENDATIONS:\n`;
    warnings.forEach(warning => {
      report += `  💭 [${warning.type}] ${warning.fundSymbol || 'GLOBAL'}: ${warning.field} - ${warning.message}\n`;
    });
    report += `\n`;
  }
  
  return report;
}