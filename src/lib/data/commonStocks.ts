/**
 * Common stocks and ETFs for autocomplete suggestions
 * This provides a good starting list for teenagers learning about investing
 */

export interface StockSuggestion {
  symbol: string;
  name: string;
  type: 'stock' | 'etf';
  category?: string;
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
 * @param query - Search query (symbol or company name)
 * @param limit - Maximum number of results to return
 * @returns Array of matching stock suggestions
 */
export function searchStocks(query: string, limit: number = 10): StockSuggestion[] {
  if (!query || query.length < 1) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Exact symbol matches first
  const exactMatches = COMMON_STOCKS.filter(stock => 
    stock.symbol.toLowerCase() === normalizedQuery
  );
  
  // Symbol starts with query
  const symbolMatches = COMMON_STOCKS.filter(stock => 
    stock.symbol.toLowerCase().startsWith(normalizedQuery) &&
    !exactMatches.some(exact => exact.symbol === stock.symbol)
  );
  
  // Company name contains query
  const nameMatches = COMMON_STOCKS.filter(stock => 
    stock.name.toLowerCase().includes(normalizedQuery) &&
    !exactMatches.some(exact => exact.symbol === stock.symbol) &&
    !symbolMatches.some(symbol => symbol.symbol === stock.symbol)
  );
  
  // Combine results with exact matches first
  return [...exactMatches, ...symbolMatches, ...nameMatches].slice(0, limit);
}

/**
 * Get suggestions for popular ETFs (good for beginners)
 */
export function getPopularETFs(): StockSuggestion[] {
  return COMMON_STOCKS.filter(stock => stock.type === 'etf');
}

/**
 * Get suggestions by category
 */
export function getStocksByCategory(category: string): StockSuggestion[] {
  return COMMON_STOCKS.filter(stock => stock.category === category);
}