#!/usr/bin/env tsx

/**
 * Comprehensive validation script for GreenToe static data system
 * Runs data validation and component integration tests
 */

import { runDataValidation, validateProjectData } from '../src/lib/validation/runValidation';
import { runComponentValidation, formatComponentValidationReport } from '../src/lib/validation/componentIntegrationTest';

async function main() {
  console.log('🚀 Starting GreenToe Static Data Validation Suite\n');
  console.log('='.repeat(60));
  
  let hasErrors = false;
  
  try {
    // Phase 1: Data Structure Validation
    console.log('\n📋 PHASE 1: DATA STRUCTURE VALIDATION');
    console.log('-'.repeat(40));
    
    const dataValidation = validateProjectData();
    
    if (!dataValidation.isValid) {
      console.log('❌ Data validation failed with critical errors!');
      hasErrors = true;
    } else if (dataValidation.errors.length > 0) {
      console.log('⚠️ Data validation passed but has non-critical issues.');
    } else {
      console.log('✅ Data validation passed perfectly!');
    }
    
    // Show detailed data validation results
    const dataReport = await import('../src/lib/validation/dataValidator').then(m => 
      m.formatValidationReport(dataValidation)
    );
    console.log(dataReport);
    
    // Phase 2: Component Integration Testing
    console.log('\n🔧 PHASE 2: COMPONENT INTEGRATION TESTING');
    console.log('-'.repeat(45));
    
    const componentValidation = runComponentValidation();
    
    if (componentValidation.failedTests > 0) {
      console.log(`❌ Component validation failed! ${componentValidation.failedTests} of ${componentValidation.totalTests} tests failed.`);
      hasErrors = true;
    } else {
      console.log(`✅ All ${componentValidation.totalTests} component integration tests passed!`);
    }
    
    // Show detailed component validation results
    const componentReport = formatComponentValidationReport(componentValidation);
    console.log(componentReport);
    
    // Phase 3: Summary and Recommendations
    console.log('\n📈 PHASE 3: VALIDATION SUMMARY');
    console.log('-'.repeat(35));
    
    if (hasErrors) {
      console.log('🚨 VALIDATION FAILED');
      console.log('Critical issues found that must be addressed before deployment.');
      console.log('\nNext steps:');
      console.log('1. Review critical errors above');
      console.log('2. Fix data structure or component integration issues');
      console.log('3. Re-run validation script');
      process.exit(1);
    } else {
      console.log('🎉 VALIDATION SUCCESSFUL');
      console.log('All critical validations passed! The static data system is ready for production.');
      
      const totalWarnings = dataValidation.warnings.length;
      if (totalWarnings > 0) {
        console.log(`\n💡 Recommendations: ${totalWarnings} optimization opportunities identified.`);
        console.log('Consider addressing these for optimal data quality and user experience.');
      } else {
        console.log('\n✨ Perfect! No recommendations - your data quality is excellent!');
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 Validation Complete');
    
  } catch (error) {
    console.error('\n💥 Validation script crashed:', error);
    console.log('\nThis indicates a serious issue with the validation system itself.');
    console.log('Please check the validation script configuration and try again.');
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

export { main as validateStaticDataSystem };