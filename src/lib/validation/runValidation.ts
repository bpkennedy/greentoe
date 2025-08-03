/**
 * Validation runner script for index fund data
 * This script loads and validates the static index fund data
 */

import { validateIndexFundData, formatValidationReport } from './dataValidator';
import { getIndexFundData } from '../staticData';

/**
 * Main validation runner function
 */
export async function runDataValidation(): Promise<void> {
  console.log('🔍 Starting Index Fund Data Validation...\n');
  
  try {
    // Load the static data
    console.log('📂 Loading static index fund data...');
    const data = getIndexFundData();
    console.log(`✅ Loaded ${data.funds.length} funds successfully\n`);
    
    // Run validation
    console.log('🧪 Running comprehensive validation checks...');
    const validationResult = validateIndexFundData(data.funds);
    
    // Display results
    const report = formatValidationReport(validationResult);
    console.log(report);
    
    // Exit with appropriate code
    if (!validationResult.isValid) {
      console.log('❌ Validation failed! Critical errors must be fixed.');
      process.exit(1);
    } else if (validationResult.errors.length > 0) {
      console.log('⚠️ Validation passed but has non-critical errors.');
      console.log('💡 Consider addressing these for better data quality.');
    } else if (validationResult.warnings.length > 0) {
      console.log('✅ Validation passed with recommendations.');
      console.log('💡 Consider addressing warnings for optimal data quality.');
    } else {
      console.log('🎉 Perfect! All validation checks passed with no issues.');
    }
    
  } catch (error) {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  }
}

/**
 * Run validation and return results (for programmatic use)
 */
export function validateProjectData() {
  try {
    const data = getIndexFundData();
    return validateIndexFundData(data.funds);
  } catch (error) {
    throw new Error(`Failed to validate project data: ${error}`);
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  runDataValidation();
}