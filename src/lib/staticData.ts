/**
 * Static Data Utility Module
 * 
 * Provides type-safe access to index fund static data with search functionality
 */

import type {
  IndexFund,
  IndexFundData,
  FundSearchOptions,
  FundSearchResult,
  WatchListFundSuggestion,
  ChartFundInfo,
  FundCategory,
  FundProvider,
  EducationalTag
} from './types/indexFunds';

// Import the static data
import indexFundData from '../../data/index-funds.json';

/**
 * Get all index fund data with proper typing
 */
export function getIndexFundData(): IndexFundData {
  return indexFundData as IndexFundData;
}

/**
 * Get all index funds
 */
export function getAllFunds(): IndexFund[] {
  const data = getIndexFundData();
  return data.funds;
}

/**
 * Get a specific fund by symbol
 */
export function getFundBySymbol(symbol: string): IndexFund | undefined {
  const funds = getAllFunds();
  return funds.find(fund => fund.symbol.toLowerCase() === symbol.toLowerCase());
}

/**
 * Get funds by category
 */
export function getFundsByCategory(categoryId: string): IndexFund[] {
  const data = getIndexFundData();
  const category = data.categories.find(cat => cat.id === categoryId);
  
  if (!category) return [];
  
  return category.fundSymbols
    .map(symbol => getFundBySymbol(symbol))
    .filter((fund): fund is IndexFund => fund !== undefined);
}

/**
 * Get funds by provider
 */
export function getFundsByProvider(providerId: string): IndexFund[] {
  const data = getIndexFundData();
  const provider = data.providers.find(prov => prov.id === providerId);
  
  if (!provider) return [];
  
  return provider.fundSymbols
    .map(symbol => getFundBySymbol(symbol))
    .filter((fund): fund is IndexFund => fund !== undefined);
}

/**
 * Get funds by educational tag
 */
export function getFundsByEducationalTag(tagId: string): IndexFund[] {
  const data = getIndexFundData();
  const tag = data.educationalTags.find(t => t.id === tagId);
  
  if (!tag) return [];
  
  return tag.fundSymbols
    .map(symbol => getFundBySymbol(symbol))
    .filter((fund): fund is IndexFund => fund !== undefined);
}

/**
 * Get all categories
 */
export function getAllCategories(): FundCategory[] {
  const data = getIndexFundData();
  return data.categories;
}

/**
 * Get all providers
 */
export function getAllProviders(): FundProvider[] {
  const data = getIndexFundData();
  return data.providers;
}

/**
 * Get all educational tags
 */
export function getAllEducationalTags(): EducationalTag[] {
  const data = getIndexFundData();
  return data.educationalTags;
}

/**
 * Search funds with advanced options
 */
export function searchFunds(options: FundSearchOptions = {}): FundSearchResult[] {
  const funds = getAllFunds();
  const results: FundSearchResult[] = [];

  for (const fund of funds) {
    const matchResult = evaluateFundMatch(fund, options);
    if (matchResult.score > 0) {
      results.push({
        fund,
        score: matchResult.score,
        matchedFields: matchResult.matchedFields
      });
    }
  }

  // Sort by score (highest first)
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Evaluate how well a fund matches search criteria
 */
function evaluateFundMatch(fund: IndexFund, options: FundSearchOptions): {
  score: number;
  matchedFields: string[];
} {
  let score = 0;
  const matchedFields: string[] = [];

  // Filter out funds that don't meet hard criteria
  if (options.category && fund.category.toLowerCase() !== options.category.toLowerCase()) {
    return { score: 0, matchedFields: [] };
  }

  if (options.provider && fund.provider.toLowerCase() !== options.provider.toLowerCase()) {
    return { score: 0, matchedFields: [] };
  }

  if (options.assetClass && fund.assetClass !== options.assetClass) {
    return { score: 0, matchedFields: [] };
  }

  if (options.maxExpenseRatio && fund.expenseRatio > options.maxExpenseRatio) {
    return { score: 0, matchedFields: [] };
  }

  if (options.minInceptionYear && fund.inceptionYear < options.minInceptionYear) {
    return { score: 0, matchedFields: [] };
  }

  if (options.educationalTagsOnly && !fund.isEducational) {
    return { score: 0, matchedFields: [] };
  }

  // Base score for any fund that passes filters
  score = 1;

  // Text search scoring
  if (options.query) {
    const query = options.query.toLowerCase();
    const searchableText = [
      fund.symbol,
      fund.name,
      fund.provider,
      fund.category,
      fund.description,
      ...fund.keyFacts,
      ...fund.educationalTags
    ].join(' ').toLowerCase();

    if (fund.symbol.toLowerCase().includes(query)) {
      score += 10;
      matchedFields.push('symbol');
    }
    
    if (fund.name.toLowerCase().includes(query)) {
      score += 8;
      matchedFields.push('name');
    }
    
    if (fund.provider.toLowerCase().includes(query)) {
      score += 5;
      matchedFields.push('provider');
    }
    
    if (fund.category.toLowerCase().includes(query)) {
      score += 5;
      matchedFields.push('category');
    }
    
    if (fund.description.toLowerCase().includes(query)) {
      score += 3;
      matchedFields.push('description');
    }
    
    if (fund.keyFacts.some(fact => fact.toLowerCase().includes(query))) {
      score += 2;
      matchedFields.push('keyFacts');
    }
    
    if (fund.educationalTags.some(tag => tag.toLowerCase().includes(query))) {
      score += 2;
      matchedFields.push('educationalTags');
    }

    // If no specific field matches but the general search text contains the query
    if (matchedFields.length === 0 && searchableText.includes(query)) {
      score += 1;
      matchedFields.push('general');
    }

    // If no match found for the query, set score to 0
    if (matchedFields.length === 0) {
      score = 0;
    }
  } else {
    // No query provided, return base score with general match
    matchedFields.push('all');
  }

  // Boost educational funds
  if (fund.isEducational) {
    score += 1;
    if (!matchedFields.includes('educational')) {
      matchedFields.push('educational');
    }
  }

  // Boost low-cost funds
  if (fund.expenseRatio <= 0.05) {
    score += 0.5;
    if (!matchedFields.includes('low-cost')) {
      matchedFields.push('low-cost');
    }
  }

  return { score, matchedFields };
}

/**
 * Get fund suggestions for watch list based on criteria
 */
export function getWatchListSuggestions(
  limit: number = 5,
  preferEducational: boolean = true
): WatchListFundSuggestion[] {
  const funds = getAllFunds();
  
  // Start with educational funds if preferred
  let candidates = preferEducational 
    ? funds.filter(fund => fund.isEducational)
    : funds;

  // If we don't have enough educational funds, add non-educational ones
  if (candidates.length < limit) {
    const additionalFunds = funds.filter(fund => 
      !fund.isEducational && !candidates.includes(fund)
    );
    candidates = [...candidates, ...additionalFunds];
  }

  // Sort by expense ratio (lower is better) and educational status
  candidates.sort((a, b) => {
    if (a.isEducational && !b.isEducational) return -1;
    if (!a.isEducational && b.isEducational) return 1;
    return a.expenseRatio - b.expenseRatio;
  });

  return candidates.slice(0, limit).map(fund => ({
    symbol: fund.symbol,
    name: fund.name,
    category: fund.category,
    expenseRatio: fund.expenseRatio,
    reason: generateSuggestionReason(fund),
    isEducational: fund.isEducational
  }));
}

/**
 * Generate a suggestion reason for a fund
 */
function generateSuggestionReason(fund: IndexFund): string {
  const reasons: string[] = [];

  if (fund.expenseRatio === 0) {
    reasons.push('Zero expense ratio');
  } else if (fund.expenseRatio <= 0.03) {
    reasons.push('Ultra-low cost');
  } else if (fund.expenseRatio <= 0.1) {
    reasons.push('Low cost');
  }

  if (fund.educationalTags.includes('beginner-friendly')) {
    reasons.push('Beginner friendly');
  }

  if (fund.educationalTags.includes('diversification')) {
    reasons.push('Great for diversification');
  }

  if (fund.category === 'Total Market') {
    reasons.push('Broad market exposure');
  }

  if (fund.symbol === 'VOO' || fund.symbol === 'SPY') {
    reasons.push('S&P 500 tracking');
  }

  if (fund.assetClass === 'Fixed Income') {
    reasons.push('Stability and income');
  }

  if (fund.region === 'International') {
    reasons.push('International diversification');
  }

  return reasons.join(', ') || 'Solid investment option';
}

/**
 * Get chart info for a fund
 */
export function getChartFundInfo(symbol: string): ChartFundInfo | undefined {
  const fund = getFundBySymbol(symbol);
  
  if (!fund) return undefined;

  return {
    symbol: fund.symbol,
    name: fund.name,
    expenseRatio: fund.expenseRatio,
    provider: fund.provider,
    category: fund.category,
    keyFacts: fund.keyFacts
  };
}

/**
 * Get beginner-friendly fund recommendations
 */
export function getBeginnerFriendlyFunds(): IndexFund[] {
  return getFundsByEducationalTag('beginner-friendly');
}

/**
 * Get low-cost fund options
 */
export function getLowCostFunds(maxExpenseRatio: number = 0.05): IndexFund[] {
  const funds = getAllFunds();
  return funds.filter(fund => fund.expenseRatio <= maxExpenseRatio);
}

/**
 * Get portfolio diversification suggestions
 */
export function getDiversificationSuggestions(): {
  domestic: IndexFund[];
  international: IndexFund[];
  bonds: IndexFund[];
} {
  const funds = getAllFunds();
  
  return {
    domestic: funds.filter(fund => 
      fund.region === 'US' && 
      fund.assetClass === 'Equity' &&
      (fund.category === 'Total Market' || fund.category === 'Large Cap')
    ),
    international: funds.filter(fund => fund.region === 'International'),
    bonds: funds.filter(fund => fund.assetClass === 'Fixed Income')
  };
}

/**
 * Validate that a fund symbol exists in our data
 */
export function isValidFundSymbol(symbol: string): boolean {
  return getFundBySymbol(symbol) !== undefined;
}

/**
 * Get fund count by category
 */
export function getFundCountByCategory(): Record<string, number> {
  const data = getIndexFundData();
  const counts: Record<string, number> = {};
  
  for (const category of data.categories) {
    counts[category.name] = category.fundSymbols.length;
  }
  
  return counts;
}

/**
 * Get average expense ratio
 */
export function getAverageExpenseRatio(): number {
  const funds = getAllFunds();
  const total = funds.reduce((sum, fund) => sum + fund.expenseRatio, 0);
  return total / funds.length;
}