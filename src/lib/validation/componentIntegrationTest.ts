/**
 * Component integration validation for static data system
 * Tests that all components can properly consume the static data
 */

import { 
  getAllFunds, 
  getFundBySymbol, 
  getFundsByCategory, 
  getFundsByProvider, 
  getFundsByEducationalTag,
  searchFunds,
  getWatchListSuggestions,
  getChartFundInfo,
  getBeginnerFriendlyFunds,
  getLowCostFunds,
  getDiversificationSuggestions,
  isValidFundSymbol,
  getFundCountByCategory,
  getAverageExpenseRatio
} from '../staticData';

export interface ComponentTestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: string;
}

export interface ComponentValidationSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: ComponentTestResult[];
}

/**
 * Run all component integration tests
 */
export function runComponentValidation(): ComponentValidationSummary {
  console.log('🧪 Running component integration validation...\n');
  
  const results: ComponentTestResult[] = [];
  
  // Test 1: Basic data loading
  results.push(testBasicDataLoading());
  
  // Test 2: Symbol-based lookup
  results.push(testSymbolBasedLookup());
  
  // Test 3: Category filtering
  results.push(testCategoryFiltering());
  
  // Test 4: Provider filtering  
  results.push(testProviderFiltering());
  
  // Test 5: Educational tag filtering
  results.push(testEducationalTagFiltering());
  
  // Test 6: Search functionality
  results.push(testSearchFunctionality());
  
  // Test 7: Watch list suggestions
  results.push(testWatchListSuggestions());
  
  // Test 8: Chart fund info
  results.push(testChartFundInfo());
  
  // Test 9: Beginner-friendly funds
  results.push(testBeginnerFriendlyFunds());
  
  // Test 10: Low-cost funds
  results.push(testLowCostFunds());
  
  // Test 11: Diversification suggestions
  results.push(testDiversificationSuggestions());
  
  // Test 12: Symbol validation
  results.push(testSymbolValidation());
  
  // Test 13: Aggregate functions
  results.push(testAggregateFunctions());
  
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = results.filter(r => !r.passed).length;
  
  return {
    totalTests: results.length,
    passedTests,
    failedTests,
    results
  };
}

function testBasicDataLoading(): ComponentTestResult {
  try {
    const funds = getAllFunds();
    
    if (!Array.isArray(funds)) {
      return { testName: 'Basic Data Loading', passed: false, error: 'getAllFunds() did not return an array' };
    }
    
    if (funds.length === 0) {
      return { testName: 'Basic Data Loading', passed: false, error: 'No funds loaded' };
    }
    
    // Check that each fund has required properties
    const requiredProps = ['symbol', 'name', 'category', 'provider', 'expenseRatio'];
    for (const fund of funds) {
      for (const prop of requiredProps) {
        if (!(prop in fund) || fund[prop as keyof typeof fund] === undefined) {
          return { 
            testName: 'Basic Data Loading', 
            passed: false, 
            error: `Fund ${fund.symbol || 'unknown'} missing required property: ${prop}` 
          };
        }
      }
    }
    
    return { 
      testName: 'Basic Data Loading', 
      passed: true, 
      details: `Successfully loaded ${funds.length} funds with all required properties` 
    };
  } catch (error) {
    return { testName: 'Basic Data Loading', passed: false, error: String(error) };
  }
}

function testSymbolBasedLookup(): ComponentTestResult {
  try {
    // Test with known symbols
    const knownSymbols = ['VTI', 'VOO', 'FNILX'];
    
    for (const symbol of knownSymbols) {
      const fund = getFundBySymbol(symbol);
      if (!fund) {
        return { 
          testName: 'Symbol-Based Lookup', 
          passed: false, 
          error: `Failed to find fund with symbol: ${symbol}` 
        };
      }
      
      if (fund.symbol !== symbol) {
        return { 
          testName: 'Symbol-Based Lookup', 
          passed: false, 
          error: `Symbol mismatch: requested ${symbol}, got ${fund.symbol}` 
        };
      }
    }
    
    // Test with non-existent symbol
    const nonExistentFund = getFundBySymbol('INVALID');
    if (nonExistentFund !== undefined) {
      return { 
        testName: 'Symbol-Based Lookup', 
        passed: false, 
        error: 'Should return undefined for non-existent symbols' 
      };
    }
    
    return { 
      testName: 'Symbol-Based Lookup', 
      passed: true, 
      details: `Successfully tested lookup for ${knownSymbols.length} known symbols and 1 invalid symbol` 
    };
  } catch (error) {
    return { testName: 'Symbol-Based Lookup', passed: false, error: String(error) };
  }
}

function testCategoryFiltering(): ComponentTestResult {
  try {
    const allFunds = getAllFunds();
    const categories = [...new Set(allFunds.map(f => f.category))];
    
    for (const category of categories) {
      const categoryFunds = getFundsByCategory(category);
      
      if (!Array.isArray(categoryFunds)) {
        return { 
          testName: 'Category Filtering', 
          passed: false, 
          error: `getFundsByCategory('${category}') did not return an array` 
        };
      }
      
      // Verify all returned funds belong to the requested category
      for (const fund of categoryFunds) {
        if (fund.category !== category) {
          return { 
            testName: 'Category Filtering', 
            passed: false, 
            error: `Fund ${fund.symbol} in wrong category: expected ${category}, got ${fund.category}` 
          };
        }
      }
    }
    
    return { 
      testName: 'Category Filtering', 
      passed: true, 
      details: `Successfully tested filtering for ${categories.length} categories` 
    };
  } catch (error) {
    return { testName: 'Category Filtering', passed: false, error: String(error) };
  }
}

function testProviderFiltering(): ComponentTestResult {
  try {
    const allFunds = getAllFunds();
    const providers = [...new Set(allFunds.map(f => f.provider))];
    
    for (const provider of providers) {
      const providerFunds = getFundsByProvider(provider);
      
      if (!Array.isArray(providerFunds)) {
        return { 
          testName: 'Provider Filtering', 
          passed: false, 
          error: `getFundsByProvider('${provider}') did not return an array` 
        };
      }
      
      // Verify all returned funds belong to the requested provider
      for (const fund of providerFunds) {
        if (fund.provider !== provider) {
          return { 
            testName: 'Provider Filtering', 
            passed: false, 
            error: `Fund ${fund.symbol} has wrong provider: expected ${provider}, got ${fund.provider}` 
          };
        }
      }
    }
    
    return { 
      testName: 'Provider Filtering', 
      passed: true, 
      details: `Successfully tested filtering for ${providers.length} providers` 
    };
  } catch (error) {
    return { testName: 'Provider Filtering', passed: false, error: String(error) };
  }
}

function testEducationalTagFiltering(): ComponentTestResult {
  try {
    const educationalTags = ['beginner-friendly', 'low-cost', 'diversification'];
    
    for (const tag of educationalTags) {
      const taggedFunds = getFundsByEducationalTag(tag);
      
      if (!Array.isArray(taggedFunds)) {
        return { 
          testName: 'Educational Tag Filtering', 
          passed: false, 
          error: `getFundsByEducationalTag('${tag}') did not return an array` 
        };
      }
      
      // Verify all returned funds have the requested tag
      for (const fund of taggedFunds) {
        if (!fund.educationalTags || !fund.educationalTags.includes(tag)) {
          return { 
            testName: 'Educational Tag Filtering', 
            passed: false, 
            error: `Fund ${fund.symbol} missing educational tag: ${tag}` 
          };
        }
      }
    }
    
    return { 
      testName: 'Educational Tag Filtering', 
      passed: true, 
      details: `Successfully tested filtering for ${educationalTags.length} educational tags` 
    };
  } catch (error) {
    return { testName: 'Educational Tag Filtering', passed: false, error: String(error) };
  }
}

function testSearchFunctionality(): ComponentTestResult {
  try {
    // Test search with different query types
    const searchTests = [
      { query: 'VTI', expectedMinResults: 1 },
      { query: 'total market', expectedMinResults: 1 },
      { query: 'vanguard', expectedMinResults: 1 },
      { query: '', expectedMinResults: 3 }, // Should return educational suggestions
    ];
    
    for (const test of searchTests) {
      const results = searchFunds({ query: test.query });
      
      if (!Array.isArray(results)) {
        return { 
          testName: 'Search Functionality', 
          passed: false, 
          error: `Search for '${test.query}' did not return an array` 
        };
      }
      
      if (results.length < test.expectedMinResults) {
        return { 
          testName: 'Search Functionality', 
          passed: false, 
          error: `Search for '${test.query}' returned ${results.length} results, expected at least ${test.expectedMinResults}` 
        };
      }
    }
    
    return { 
      testName: 'Search Functionality', 
      passed: true, 
      details: `Successfully tested ${searchTests.length} search scenarios` 
    };
  } catch (error) {
    return { testName: 'Search Functionality', passed: false, error: String(error) };
  }
}

function testWatchListSuggestions(): ComponentTestResult {
  try {
    const suggestions = getWatchListSuggestions(5, true);
    
    if (!Array.isArray(suggestions)) {
      return { 
        testName: 'Watch List Suggestions', 
        passed: false, 
        error: 'getWatchListSuggestions() did not return an array' 
      };
    }
    
    if (suggestions.length === 0) {
      return { 
        testName: 'Watch List Suggestions', 
        passed: false, 
        error: 'No watch list suggestions returned' 
      };
    }
    
    if (suggestions.length > 5) {
      return { 
        testName: 'Watch List Suggestions', 
        passed: false, 
        error: `Too many suggestions returned: ${suggestions.length}, expected max 5` 
      };
    }
    
    return { 
      testName: 'Watch List Suggestions', 
      passed: true, 
      details: `Successfully returned ${suggestions.length} watch list suggestions` 
    };
  } catch (error) {
    return { testName: 'Watch List Suggestions', passed: false, error: String(error) };
  }
}

function testChartFundInfo(): ComponentTestResult {
  try {
    // Test with known educational fund
    const chartInfo = getChartFundInfo('VTI');
    
    if (!chartInfo) {
      return { 
        testName: 'Chart Fund Info', 
        passed: false, 
        error: 'No chart fund info returned for VTI' 
      };
    }
    
    const requiredProps = ['provider', 'category', 'expenseRatio', 'keyFacts'];
    for (const prop of requiredProps) {
      if (!(prop in chartInfo)) {
        return { 
          testName: 'Chart Fund Info', 
          passed: false, 
          error: `Chart fund info missing required property: ${prop}` 
        };
      }
    }
    
    // Test with non-existent symbol
    const nonExistentInfo = getChartFundInfo('INVALID');
    if (nonExistentInfo !== undefined) {
      return { 
        testName: 'Chart Fund Info', 
        passed: false, 
        error: 'Should return undefined for non-existent symbols' 
      };
    }
    
    return { 
      testName: 'Chart Fund Info', 
      passed: true, 
      details: 'Successfully retrieved chart fund info and handled invalid symbols' 
    };
  } catch (error) {
    return { testName: 'Chart Fund Info', passed: false, error: String(error) };
  }
}

function testBeginnerFriendlyFunds(): ComponentTestResult {
  try {
    const beginnerFunds = getBeginnerFriendlyFunds();
    
    if (!Array.isArray(beginnerFunds)) {
      return { 
        testName: 'Beginner-Friendly Funds', 
        passed: false, 
        error: 'getBeginnerFriendlyFunds() did not return an array' 
      };
    }
    
    if (beginnerFunds.length === 0) {
      return { 
        testName: 'Beginner-Friendly Funds', 
        passed: false, 
        error: 'No beginner-friendly funds returned' 
      };
    }
    
    // Verify all returned funds are marked as educational or have beginner-friendly tag
    for (const fund of beginnerFunds) {
      if (!fund.isEducational && 
          (!fund.educationalTags || !fund.educationalTags.includes('beginner-friendly'))) {
        return { 
          testName: 'Beginner-Friendly Funds', 
          passed: false, 
          error: `Fund ${fund.symbol} is not marked as beginner-friendly` 
        };
      }
    }
    
    return { 
      testName: 'Beginner-Friendly Funds', 
      passed: true, 
      details: `Successfully returned ${beginnerFunds.length} beginner-friendly funds` 
    };
  } catch (error) {
    return { testName: 'Beginner-Friendly Funds', passed: false, error: String(error) };
  }
}

function testLowCostFunds(): ComponentTestResult {
  try {
    const lowCostFunds = getLowCostFunds(0.1); // Funds with expense ratio <= 0.1%
    
    if (!Array.isArray(lowCostFunds)) {
      return { 
        testName: 'Low-Cost Funds', 
        passed: false, 
        error: 'getLowCostFunds() did not return an array' 
      };
    }
    
    // Verify all returned funds meet the expense ratio criteria
    for (const fund of lowCostFunds) {
      if (fund.expenseRatio > 0.1) {
        return { 
          testName: 'Low-Cost Funds', 
          passed: false, 
          error: `Fund ${fund.symbol} has expense ratio ${fund.expenseRatio}%, expected <= 0.1%` 
        };
      }
    }
    
    return { 
      testName: 'Low-Cost Funds', 
      passed: true, 
      details: `Successfully returned ${lowCostFunds.length} low-cost funds` 
    };
  } catch (error) {
    return { testName: 'Low-Cost Funds', passed: false, error: String(error) };
  }
}

function testDiversificationSuggestions(): ComponentTestResult {
  try {
    const diversificationFunds = getDiversificationSuggestions();
    
    if (typeof diversificationFunds !== 'object' || diversificationFunds === null) {
      return { 
        testName: 'Diversification Suggestions', 
        passed: false, 
        error: 'getDiversificationSuggestions() did not return an object' 
      };
    }
    
    const requiredCategories = ['domestic', 'international', 'bonds'];
    for (const category of requiredCategories) {
      if (!(category in diversificationFunds)) {
        return { 
          testName: 'Diversification Suggestions', 
          passed: false, 
          error: `Missing required category in diversification suggestions: ${category}` 
        };
      }
      
      if (!Array.isArray(diversificationFunds[category as keyof typeof diversificationFunds])) {
        return { 
          testName: 'Diversification Suggestions', 
          passed: false, 
          error: `Category ${category} should be an array` 
        };
      }
    }
    
    const totalSuggestions = diversificationFunds.domestic.length + 
                           diversificationFunds.international.length + 
                           diversificationFunds.bonds.length;
    
    if (totalSuggestions === 0) {
      return { 
        testName: 'Diversification Suggestions', 
        passed: false, 
        error: 'No diversification suggestions returned in any category' 
      };
    }
    
    return { 
      testName: 'Diversification Suggestions', 
      passed: true, 
      details: `Successfully returned ${totalSuggestions} diversification suggestions across ${requiredCategories.length} categories` 
    };
  } catch (error) {
    return { testName: 'Diversification Suggestions', passed: false, error: String(error) };
  }
}

function testSymbolValidation(): ComponentTestResult {
  try {
    // Test valid symbols
    const validSymbols = ['VTI', 'VOO', 'FNILX'];
    for (const symbol of validSymbols) {
      if (!isValidFundSymbol(symbol)) {
        return { 
          testName: 'Symbol Validation', 
          passed: false, 
          error: `Valid symbol ${symbol} was marked as invalid` 
        };
      }
    }
    
    // Test invalid symbols
    const invalidSymbols = ['INVALID', 'XYZ123', ''];
    for (const symbol of invalidSymbols) {
      if (isValidFundSymbol(symbol)) {
        return { 
          testName: 'Symbol Validation', 
          passed: false, 
          error: `Invalid symbol ${symbol} was marked as valid` 
        };
      }
    }
    
    return { 
      testName: 'Symbol Validation', 
      passed: true, 
      details: `Successfully validated ${validSymbols.length} valid and ${invalidSymbols.length} invalid symbols` 
    };
  } catch (error) {
    return { testName: 'Symbol Validation', passed: false, error: String(error) };
  }
}

function testAggregateFunctions(): ComponentTestResult {
  try {
    // Test fund count by category
    const categoryCounts = getFundCountByCategory();
    if (typeof categoryCounts !== 'object' || categoryCounts === null) {
      return { 
        testName: 'Aggregate Functions', 
        passed: false, 
        error: 'getFundCountByCategory() did not return an object' 
      };
    }
    
    // Test average expense ratio
    const avgExpenseRatio = getAverageExpenseRatio();
    if (typeof avgExpenseRatio !== 'number' || isNaN(avgExpenseRatio)) {
      return { 
        testName: 'Aggregate Functions', 
        passed: false, 
        error: 'getAverageExpenseRatio() did not return a valid number' 
      };
    }
    
    if (avgExpenseRatio < 0 || avgExpenseRatio > 3) {
      return { 
        testName: 'Aggregate Functions', 
        passed: false, 
        error: `Average expense ratio ${avgExpenseRatio} is outside reasonable range (0-3%)` 
      };
    }
    
    return { 
      testName: 'Aggregate Functions', 
      passed: true, 
      details: `Category counts and average expense ratio (${avgExpenseRatio.toFixed(3)}%) calculated successfully` 
    };
  } catch (error) {
    return { testName: 'Aggregate Functions', passed: false, error: String(error) };
  }
}

/**
 * Format component validation results for human reading
 */
export function formatComponentValidationReport(summary: ComponentValidationSummary): string {
  let report = `\n=== COMPONENT INTEGRATION VALIDATION REPORT ===\n\n`;
  
  report += `📊 SUMMARY:\n`;
  report += `  Total Tests: ${summary.totalTests}\n`;
  report += `  Passed: ${summary.passedTests}\n`;
  report += `  Failed: ${summary.failedTests}\n`;
  report += `  Success Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%\n\n`;
  
  // Test results
  report += `🧪 TEST RESULTS:\n`;
  summary.results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    report += `  ${status} ${result.testName}\n`;
    
    if (result.error) {
      report += `     Error: ${result.error}\n`;
    }
    
    if (result.details) {
      report += `     Details: ${result.details}\n`;
    }
  });
  
  return report;
}