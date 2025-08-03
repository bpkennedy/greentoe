/**
 * Common stocks and ETFs for autocomplete suggestions
 * This provides a good starting list for teenagers learning about investing
 * Enhanced with index fund data integration
 */

import { getWatchListSuggestions, getAllFunds } from '../staticData';

export interface StockSuggestion {
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'index-fund';
  category?: string;
  expenseRatio?: number;
  isEducational?: boolean;
  reason?: string;
}

export const COMMON_STOCKS: StockSuggestion[] = [
  // Popular Large Cap Stocks
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', category: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', category: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', type: 'stock', category: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', category: 'Consumer Discretionary' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', category: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', category: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', category: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', category: 'Communication Services' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', category: 'Communication Services' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock', category: 'Technology' },
  
  // Financial Services
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', category: 'Financial Services' },
  { symbol: 'BAC', name: 'Bank of America Corporation', type: 'stock', category: 'Financial Services' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'stock', category: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', category: 'Financial Services' },
  { symbol: 'MA', name: 'Mastercard Incorporated', type: 'stock', category: 'Financial Services' },
  
  // Consumer Brands
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', category: 'Consumer Staples' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock', category: 'Consumer Staples' },
  { symbol: 'NKE', name: 'NIKE Inc.', type: 'stock', category: 'Consumer Discretionary' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', type: 'stock', category: 'Consumer Discretionary' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', type: 'stock', category: 'Consumer Discretionary' },
  
  // Healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', category: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock', category: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock', category: 'Healthcare' },
  
  // Popular ETFs for Beginners
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', category: 'Large Cap Blend' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', category: 'Large Cap Growth' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', category: 'Large Cap Blend' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', category: 'Large Cap Blend' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'etf', category: 'Foreign Large Blend' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'etf', category: 'Diversified Emerging Mkts' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'etf', category: 'Intermediate Core Bond' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate Index Fund ETF', type: 'etf', category: 'Real Estate' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf', category: 'Commodities Precious Metals' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', type: 'etf', category: 'Small Cap Blend' },
];

/**
 * Search for stock suggestions based on symbol or name
 * Enhanced with index fund integration and educational focus
 * @param query - Search query (symbol or company name)
 * @param limit - Maximum number of results to return
 * @returns Array of matching stock suggestions
 */
export function searchStocks(query: string, limit: number = 10): StockSuggestion[] {
  if (!query || query.length < 1) {
    // Return educational index fund suggestions when no query
    return getEducationalIndexFundSuggestions(limit);
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: StockSuggestion[] = [];
  
  // Search in common stocks/ETFs
  const exactMatches = COMMON_STOCKS.filter(stock => 
    stock.symbol.toLowerCase() === normalizedQuery
  );
  
  const symbolMatches = COMMON_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().startsWith(normalizedQuery) &&
    !exactMatches.some(exact => exact.symbol === stock.symbol)
  );
  
  const nameMatches = COMMON_STOCKS.filter(stock => 
    stock.name.toLowerCase().includes(normalizedQuery) &&
    !exactMatches.some(exact => exact.symbol === stock.symbol) &&
    !symbolMatches.some(symbol => symbol.symbol === stock.symbol)
  );
  
  // Add common stock results
  results.push(...exactMatches, ...symbolMatches, ...nameMatches);
  
  // Search in index fund data
  try {
    const indexFunds = getAllFunds();
    
    // Exact symbol matches in index funds
    const indexExactMatches = indexFunds
      .filter(fund => fund.symbol.toLowerCase() === normalizedQuery)
      .map(fund => ({
        symbol: fund.symbol,
        name: fund.name,
        type: 'index-fund' as const,
        category: fund.category,
        expenseRatio: fund.expenseRatio,
        isEducational: fund.isEducational,
        reason: `${fund.provider} • ${fund.expenseRatio}% expense ratio`
      }))
      .filter(suggestion => !results.some(r => r.symbol === suggestion.symbol));
    
    // Symbol starts with query in index funds
    const indexSymbolMatches = indexFunds
      .filter(fund => 
        fund.symbol.toLowerCase().startsWith(normalizedQuery) &&
        !indexExactMatches.some(exact => exact.symbol === fund.symbol)
      )
      .map(fund => ({
        symbol: fund.symbol,
        name: fund.name,
        type: 'index-fund' as const,
        category: fund.category,
        expenseRatio: fund.expenseRatio,
        isEducational: fund.isEducational,
        reason: `${fund.provider} • ${fund.expenseRatio}% expense ratio`
      }))
      .filter(suggestion => !results.some(r => r.symbol === suggestion.symbol));
    
    // Name contains query in index funds
    const indexNameMatches = indexFunds
      .filter(fund => 
        fund.name.toLowerCase().includes(normalizedQuery) &&
        !indexExactMatches.some(exact => exact.symbol === fund.symbol) &&
        !indexSymbolMatches.some(symbol => symbol.symbol === fund.symbol)
      )
      .map(fund => ({
        symbol: fund.symbol,
        name: fund.name,
        type: 'index-fund' as const,
        category: fund.category,
        expenseRatio: fund.expenseRatio,
        isEducational: fund.isEducational,
        reason: `${fund.provider} • ${fund.expenseRatio}% expense ratio`
      }))
      .filter(suggestion => !results.some(r => r.symbol === suggestion.symbol));
    
    // Add index fund results with educational ones first
    const educationalIndexFunds = [...indexExactMatches, ...indexSymbolMatches, ...indexNameMatches]
      .filter(fund => fund.isEducational)
      .sort((a, b) => (a.expenseRatio || 0) - (b.expenseRatio || 0));
    
    const nonEducationalIndexFunds = [...indexExactMatches, ...indexSymbolMatches, ...indexNameMatches]
      .filter(fund => !fund.isEducational)
      .sort((a, b) => (a.expenseRatio || 0) - (b.expenseRatio || 0));
    
    results.push(...educationalIndexFunds, ...nonEducationalIndexFunds);
    
  } catch (error) {
    console.warn('Error searching index funds:', error);
  }
  
  // Sort results: exact matches first, then educational, then by expense ratio
  const sortedResults = results.sort((a, b) => {
    // Exact symbol matches first
    if (a.symbol.toLowerCase() === normalizedQuery && b.symbol.toLowerCase() !== normalizedQuery) return -1;
    if (b.symbol.toLowerCase() === normalizedQuery && a.symbol.toLowerCase() !== normalizedQuery) return 1;
    
    // Educational index funds prioritized
    if (a.isEducational && !b.isEducational) return -1;
    if (!a.isEducational && b.isEducational) return 1;
    
    // Lower expense ratio preferred for index funds
    if (a.type === 'index-fund' && b.type === 'index-fund') {
      return (a.expenseRatio || 0) - (b.expenseRatio || 0);
    }
    
    return 0;
  });
  
  return sortedResults.slice(0, limit);
}

/**
 * Get educational index fund suggestions for when no query is provided
 */
export function getEducationalIndexFundSuggestions(limit: number = 5): StockSuggestion[] {
  try {
    const suggestions = getWatchListSuggestions(limit, true);
    return suggestions.map(suggestion => ({
      symbol: suggestion.symbol,
      name: suggestion.name,
      type: 'index-fund' as const,
      category: suggestion.category,
      expenseRatio: suggestion.expenseRatio,
      isEducational: suggestion.isEducational,
      reason: suggestion.reason
    }));
  } catch (error) {
    console.warn('Error getting educational index fund suggestions:', error);
    // Fallback to common ETFs
    return COMMON_STOCKS.filter(stock => stock.type === 'etf').slice(0, limit);
  }
}

/**
 * Get suggestions for popular ETFs (good for beginners)
 * Enhanced with index fund data
 */
export function getPopularETFs(): StockSuggestion[] {
  const commonETFs = COMMON_STOCKS.filter(stock => stock.type === 'etf');
  
  try {
    // Add educational index funds
    const educationalFunds = getEducationalIndexFundSuggestions(8);
    const combined = [...commonETFs, ...educationalFunds];
    
    // Remove duplicates and sort by educational status and expense ratio
    const unique = combined.reduce((acc, current) => {
      const existing = acc.find(item => item.symbol === current.symbol);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as StockSuggestion[]);
    
    return unique.sort((a, b) => {
      if (a.isEducational && !b.isEducational) return -1;
      if (!a.isEducational && b.isEducational) return 1;
      return (a.expenseRatio || 0) - (b.expenseRatio || 0);
    });
  } catch (error) {
    console.warn('Error enhancing popular ETFs:', error);
    return commonETFs;
  }
}

/**
 * Get suggestions by category
 * Enhanced with index fund data
 */
export function getStocksByCategory(category: string): StockSuggestion[] {
  const commonStocks = COMMON_STOCKS.filter(stock => stock.category === category);
  
  try {
    // Add matching index funds
    const indexFunds = getAllFunds()
      .filter(fund => fund.category.toLowerCase().includes(category.toLowerCase()))
      .map(fund => ({
        symbol: fund.symbol,
        name: fund.name,
        type: 'index-fund' as const,
        category: fund.category,
        expenseRatio: fund.expenseRatio,
        isEducational: fund.isEducational,
        reason: `${fund.provider} • ${fund.expenseRatio}% expense ratio`
      }));
    
    return [...commonStocks, ...indexFunds];
  } catch (error) {
    console.warn('Error getting index funds by category:', error);
    return commonStocks;
  }
}

/**
 * Get beginner-friendly investment suggestions
 */
export function getBeginnerFriendlySuggestions(limit: number = 6): StockSuggestion[] {
  try {
    const educationalFunds = getEducationalIndexFundSuggestions(limit);
    return educationalFunds;
  } catch (error) {
    console.warn('Error getting beginner-friendly suggestions:', error);
    // Fallback to basic ETFs
    return COMMON_STOCKS.filter(stock => 
      stock.type === 'etf' && 
      ['VTI', 'VOO', 'SPY', 'QQQ'].includes(stock.symbol)
    );
  }
}