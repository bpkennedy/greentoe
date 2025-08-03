import yahooFinance from 'yahoo-finance2';
import type {
  FMPProcessedStockData,
  FMPStockDataPoint,
  FMPStockDataError,
} from '../types/financialModelingPrep';

/**
 * Yahoo Finance historical data structure (from the library)
 */
interface YahooHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
}

/**
 * Rate limiting and retry configuration
 */
const RATE_LIMIT_DELAY = 100; // 100ms between requests
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Progressive backoff in ms

/**
 * Create a FMPStockDataError for consistent error handling
 */
function createStockError(
  type: FMPStockDataError['type'], 
  message: string, 
  canRetry: boolean = false
): FMPStockDataError {
  return {
    type,
    message,
    canRetry
  };
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Convert Yahoo Finance data point to FMP-compatible format
 */
function convertYahooDataToFMP(yahooData: YahooHistoricalData): FMPStockDataPoint {
  // Calculate change and changePercent if we have previous day data
  // For now, we'll calculate these as 0 - they can be computed in post-processing
  const change = 0;
  const changePercent = 0;
  const changeOverTime = 0;

  return {
    date: yahooData.date.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
    open: Number(yahooData.open.toFixed(2)),
    high: Number(yahooData.high.toFixed(2)),
    low: Number(yahooData.low.toFixed(2)),
    close: Number(yahooData.close.toFixed(2)),
    adjClose: Number((yahooData.adjClose || yahooData.close).toFixed(2)),
    volume: yahooData.volume,
    unadjustedVolume: yahooData.volume, // Yahoo doesn't distinguish, use same value
    change,
    changePercent,
    vwap: Number(((yahooData.high + yahooData.low + yahooData.close) / 3).toFixed(2)), // Approximate VWAP
    label: yahooData.date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: '2-digit' 
    }),
    changeOverTime
  };
}

/**
 * Calculate change and changePercent for all data points
 */
function calculateChanges(dataPoints: FMPStockDataPoint[]): FMPStockDataPoint[] {
  return dataPoints.map((point, index) => {
    if (index === dataPoints.length - 1) {
      // Last item (oldest), no previous day to compare
      return point;
    }

    const currentClose = point.close;
    const previousClose = dataPoints[index + 1].close; // Next item is previous day (sorted newest first)
    const change = Number((currentClose - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));
    const changeOverTime = Number((changePercent / 100).toFixed(4));

    return {
      ...point,
      change,
      changePercent,
      changeOverTime
    };
  });
}

/**
 * Fetch stock data from Yahoo Finance with retry logic
 */
async function fetchWithRetry(symbol: string, retryCount = 0): Promise<YahooHistoricalData[]> {
  try {
    // Add rate limiting delay
    if (retryCount > 0) {
      await sleep(RETRY_DELAYS[retryCount - 1] || 4000);
    } else {
      await sleep(RATE_LIMIT_DELAY);
    }

    // Calculate date range (last 2 years of data to match FMP behavior)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(endDate.getFullYear() - 2);

    const queryOptions = {
      period1: startDate.toISOString().split('T')[0],
      period2: endDate.toISOString().split('T')[0],
      interval: '1d' as const
    };

    console.log(`Fetching Yahoo Finance data for ${symbol} from: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);

    const result = await yahooFinance.historical(symbol.toUpperCase(), queryOptions);
    
    if (!result || result.length === 0) {
      throw createStockError('INVALID_SYMBOL', `No data found for symbol: ${symbol}`);
    }

    return result;

  } catch (error) {
    console.error(`Yahoo Finance API error (attempt ${retryCount + 1}):`, error);

    // Check if we should retry
    if (retryCount < MAX_RETRIES) {
      // Retry on network errors or rate limits
      if (error instanceof Error && 
          (error.message.includes('network') || 
           error.message.includes('timeout') ||
           error.message.includes('rate') ||
           error.message.includes('429'))) {
        console.log(`Retrying Yahoo Finance request for ${symbol} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})`);
        return fetchWithRetry(symbol, retryCount + 1);
      }
    }

    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw createStockError('INVALID_SYMBOL', `Symbol not found: ${symbol}`);
      }
      if (error.message.includes('429') || error.message.includes('rate')) {
        throw createStockError('RATE_LIMIT', 'Yahoo Finance rate limit exceeded. Please try again later.', true);
      }
      if (error.message.includes('network') || error.message.includes('timeout')) {
        throw createStockError('NETWORK_ERROR', 'Network error connecting to Yahoo Finance. Please check your connection.', true);
      }
    }

    // Re-throw FMPStockDataError as-is
    if (typeof error === 'object' && error !== null && 'type' in error && 'canRetry' in error) {
      throw error;
    }

    // Generic API error
    throw createStockError('API_ERROR', `Yahoo Finance API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function to fetch and process Yahoo Finance data into FMP-compatible format
 */
export async function fetchStockData(symbol: string): Promise<FMPProcessedStockData> {
  try {
    // Validate input
    if (!symbol || typeof symbol !== 'string' || symbol.trim().length === 0) {
      throw createStockError('INVALID_SYMBOL', 'Stock symbol is required');
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Fetch raw data from Yahoo Finance
    const yahooData = await fetchWithRetry(cleanSymbol);
    
    // Convert to FMP format
    const convertedData = yahooData.map(convertYahooDataToFMP);
    
    // Sort by date (newest first) to match FMP behavior
    const sortedData = convertedData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Calculate change and changePercent values
    const dataWithChanges = calculateChanges(sortedData);
    
    console.log(`Successfully processed ${dataWithChanges.length} data points for ${cleanSymbol} from Yahoo Finance`);
    
    return {
      symbol: cleanSymbol,
      historical: dataWithChanges,
      dataPoints: dataWithChanges.length
    };

  } catch (error) {
    console.error('Error in Yahoo Finance fetchStockData:', error);
    
    // Re-throw FMPStockDataError as-is
    if (typeof error === 'object' && error !== null && 'type' in error && 'canRetry' in error) {
      throw error;
    }
    
    // Handle unexpected errors
    throw createStockError(
      'API_ERROR', 
      `Failed to fetch stock data from Yahoo Finance: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Yahoo Finance search result quote interface
 */
interface YahooSearchQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  quoteType?: string;
  sector?: string;
  exchange?: string;
}

/**
 * Yahoo Finance search response interface
 */
interface YahooSearchResponse {
  quotes?: YahooSearchQuote[];
}

/**
 * Stock suggestion interface for search results
 */
interface StockSearchSuggestion {
  symbol: string;
  name: string;
  type: 'stock' | 'etf';
  category: string;
  exchange?: string;
  reason: string;
}

/**
 * Search for stocks using Yahoo Finance
 */
export async function searchStocks(query: string): Promise<StockSearchSuggestion[]> {
  try {
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.trim();
    console.log(`Searching Yahoo Finance for: ${cleanQuery}`);
    
    // Use yahoo-finance2 search functionality
    const searchResults = await yahooFinance.search(cleanQuery) as YahooSearchResponse;
    
    console.log(`Yahoo Finance search returned ${searchResults?.quotes?.length || 0} results`);
    
    // Debug: Log the raw quotes to see what we're getting
    console.log('🔍 Raw search results:', searchResults?.quotes?.map(q => ({
      symbol: q.symbol,
      shortName: q.shortName,
      longName: q.longName,
      quoteType: q.quoteType
    })));
    
    // Transform results to match our StockSuggestion format
    const suggestions = (searchResults?.quotes || [])
      .filter((quote: YahooSearchQuote) => {
        // Only require symbol and at least one name field
        const hasValidData = quote.symbol && (quote.shortName || quote.longName);
        console.log(`🔍 Filtering quote ${quote.symbol}: hasValidData=${hasValidData}`);
        return hasValidData;
      })
      .slice(0, 10) // Limit to 10 results
      .map((quote: YahooSearchQuote): StockSearchSuggestion => ({
        symbol: quote.symbol,
        name: quote.shortName || quote.longName || quote.symbol,
        type: quote.quoteType === 'ETF' ? 'etf' : 'stock',
        category: quote.sector || 'Unknown',
        exchange: quote.exchange,
        reason: `${quote.exchange || 'Unknown'} • ${quote.quoteType || 'Stock'}`
      }));

    console.log(`🔍 Final suggestions count: ${suggestions.length}`);
    return suggestions;
  } catch (error) {
    console.error('Error searching Yahoo Finance:', error);
    return [];
  }
}

/**
 * Health check for Yahoo Finance API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Test with a known stable symbol
    const testData = await fetchWithRetry('AAPL');
    return testData.length > 0;
  } catch (error) {
    console.error('Yahoo Finance health check failed:', error);
    return false;
  }
}