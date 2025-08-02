/**
 * Alpha Vantage API utility for fetching stock data
 * Handles rate limits, error responses, and data processing
 */

import type {
  AlphaVantageApiResponse,
  AlphaVantageSuccessResponse,
  AlphaVantageRateLimitError,
  AlphaVantageErrorResponse,
  ProcessedStockData,
  StockDataError,
  StockDataPoint,
} from '../types/alphaVantage';

// API configuration
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

/**
 * Get Alpha Vantage API key from environment variables
 * @throws {Error} If API key is not configured
 */
function getApiKey(): string {
  const apiKey = process.env.ALPHA_VANTAGE_KEY || process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;
  
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not found. Please set ALPHA_VANTAGE_KEY or NEXT_PUBLIC_ALPHA_VANTAGE_KEY environment variable.');
  }
  
  return apiKey;
}

/**
 * Check if response indicates a rate limit error
 */
function isRateLimitError(response: AlphaVantageApiResponse): response is AlphaVantageRateLimitError {
  return 'Note' in response && typeof response.Note === 'string';
}

/**
 * Check if response indicates an API error
 */
function isApiError(response: AlphaVantageApiResponse): response is AlphaVantageErrorResponse {
  return 'Error Message' in response && typeof response['Error Message'] === 'string';
}

/**
 * Check if response is a successful data response
 */
function isSuccessResponse(response: AlphaVantageApiResponse): response is AlphaVantageSuccessResponse {
  return 'Meta Data' in response && 'Time Series (Daily)' in response;
}

/**
 * Process raw Alpha Vantage response into normalized data structure
 */
function processStockData(response: AlphaVantageSuccessResponse): ProcessedStockData {
  const metadata = {
    symbol: response['Meta Data']['2. Symbol'],
    lastRefreshed: response['Meta Data']['3. Last Refreshed'],
    timeZone: response['Meta Data']['5. Time Zone'],
    outputSize: response['Meta Data']['4. Output Size'],
  };

  const timeSeries: StockDataPoint[] = Object.entries(response['Time Series (Daily)'])
    .map(([date, data]) => ({
      date,
      open: parseFloat(data['1. open']),
      high: parseFloat(data['2. high']),
      low: parseFloat(data['3. low']),
      close: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume'], 10),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending (newest first)

  return {
    metadata,
    timeSeries,
  };
}

/**
 * Create a StockDataError from various error conditions
 */
function createStockError(type: StockDataError['type'], message: string, canRetry: boolean = false): StockDataError {
  return {
    type,
    message,
    canRetry,
  };
}

/**
 * Fetch stock data for a given symbol from Alpha Vantage API
 * @param symbol - Stock ticker symbol (e.g., 'AAPL', 'MSFT')
 * @returns Promise resolving to processed stock data
 * @throws {StockDataError} For various error conditions
 */
export async function fetchStockData(symbol: string): Promise<ProcessedStockData> {
  // Validate input
  if (!symbol || typeof symbol !== 'string') {
    throw createStockError('INVALID_SYMBOL', 'Symbol must be a non-empty string');
  }

  const trimmedSymbol = symbol.trim().toUpperCase();
  if (!trimmedSymbol) {
    throw createStockError('INVALID_SYMBOL', 'Symbol cannot be empty or whitespace only');
  }

  // Basic symbol format validation (alphanumeric + dots/hyphens)
  if (!/^[A-Z0-9.-]+$/.test(trimmedSymbol)) {
    throw createStockError('INVALID_SYMBOL', 'Symbol contains invalid characters. Use only letters, numbers, dots, and hyphens.');
  }

  try {
    const apiKey = getApiKey();
    
    // Build API URL
    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    url.searchParams.set('function', 'TIME_SERIES_DAILY');
    url.searchParams.set('symbol', trimmedSymbol);
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('outputsize', 'compact'); // Last 100 data points

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GreenThumb/1.0',
      },
    });

    clearTimeout(timeoutId);

    // Handle HTTP errors
    if (!response.ok) {
      throw createStockError(
        'API_ERROR',
        `HTTP ${response.status}: ${response.statusText}`,
        response.status >= 500 // Retry on server errors
      );
    }

    // Parse JSON response
    let data: AlphaVantageApiResponse;
    try {
      data = await response.json();
    } catch (parseError) {
      throw createStockError('API_ERROR', 'Invalid JSON response from API');
    }

    // Handle different response types
    if (isRateLimitError(data)) {
      throw createStockError(
        'RATE_LIMIT',
        'API rate limit exceeded. Please try again later.',
        true
      );
    }

    if (isApiError(data)) {
      throw createStockError(
        'INVALID_SYMBOL',
        `Invalid symbol "${trimmedSymbol}": ${data['Error Message']}`
      );
    }

    if (!isSuccessResponse(data)) {
      throw createStockError('API_ERROR', 'Unexpected API response format');
    }

    // Process and return successful data
    return processStockData(data);

  } catch (error) {
    // Handle fetch errors (network issues, timeouts, etc.)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw createStockError('NETWORK_ERROR', 'Request timeout. Please check your connection.', true);
      }
      
      if (error.message.includes('API key')) {
        throw createStockError('API_ERROR', error.message);
      }
      
      // Re-throw StockDataError as-is
      if ('type' in error && 'message' in error && 'canRetry' in error) {
        throw error;
      }
    }

    // Generic network error
    throw createStockError('NETWORK_ERROR', 'Failed to fetch stock data. Please check your connection.', true);
  }
}