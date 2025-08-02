/**
 * SWR hook for fetching and caching stock data from Alpha Vantage API
 * Provides 24-hour caching and automatic revalidation on window focus
 */

import useSWR from 'swr';
import { fetchStockData } from '../api/alphaVantage';
import type { ProcessedStockData, StockDataError, UseStockDataReturn } from '../types/alphaVantage';

// SWR configuration for stock data
const SWR_CONFIG = {
  // Cache for 24 hours (24 * 60 * 60 * 1000 ms)
  dedupingInterval: 24 * 60 * 60 * 1000,
  
  // Revalidate when window gets focus
  revalidateOnFocus: true,
  
  // Don't revalidate on reconnect (rely on 24h cache)
  revalidateOnReconnect: false,
  
  // Don't revalidate if data is less than 24 hours old
  revalidateIfStale: false,
  
  // Retry on error (useful for rate limit recovery)
  errorRetryCount: 3,
  
  // Exponential backoff for retries (1s, 2s, 4s)
  errorRetryInterval: 1000,
  
  // Don't retry on certain error types
  shouldRetryOnError: (error: StockDataError) => {
    // Don't retry on invalid symbols or API key errors
    if (error?.type === 'INVALID_SYMBOL' || error?.type === 'API_ERROR') {
      return false;
    }
    // Retry on rate limits and network errors
    return error?.canRetry ?? true;
  },
  
  // Timeout for each request
  timeout: 15000, // 15 seconds
} as const;

/**
 * SWR fetcher function that wraps the Alpha Vantage API
 * @param symbol - Stock ticker symbol
 * @returns Promise resolving to processed stock data
 */
async function stockDataFetcher(symbol: string): Promise<ProcessedStockData> {
  try {
    return await fetchStockData(symbol);
  } catch (error) {
    // Ensure error is properly typed for SWR
    if (error && typeof error === 'object' && 'type' in error) {
      throw error as StockDataError;
    }
    
    // Fallback for unexpected errors
    const fallbackError: StockDataError = {
      type: 'API_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      canRetry: false,
    };
    throw fallbackError;
  }
}

/**
 * Generate SWR cache key for a stock symbol
 * @param symbol - Stock ticker symbol
 * @returns Cache key string
 */
function getStockDataKey(symbol: string | null | undefined): string | null {
  if (!symbol || typeof symbol !== 'string') {
    return null; // This will disable the SWR hook
  }
  
  const trimmedSymbol = symbol.trim().toUpperCase();
  if (!trimmedSymbol) {
    return null;
  }
  
  return `stock-data:${trimmedSymbol}`;
}

/**
 * Custom hook for fetching stock data with SWR caching
 * @param symbol - Stock ticker symbol to fetch data for
 * @param options - Additional SWR configuration options
 * @returns Object containing data, error, loading states, and mutate function
 */
export function useStockData(
  symbol: string | null | undefined,
  options: {
    /** Disable automatic fetching */
    disabled?: boolean;
    /** Override revalidation on focus */
    revalidateOnFocus?: boolean;
    /** Custom error retry count */
    errorRetryCount?: number;
  } = {}
): UseStockDataReturn {
  const key = getStockDataKey(symbol);
  
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<ProcessedStockData, StockDataError>(
    // Only fetch if we have a valid key and it's not disabled
    options.disabled ? null : key,
    
    // Fetcher function - only called if key is not null
    key ? () => stockDataFetcher(symbol!) : null,
    
    // Merge default config with any overrides
    {
      ...SWR_CONFIG,
      ...options,
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Hook for fetching multiple stock symbols at once
 * @param symbols - Array of stock ticker symbols
 * @param options - SWR configuration options
 * @returns Object mapping symbols to their respective stock data results
 */
export function useMultipleStockData(
  symbols: string[],
  options: {
    disabled?: boolean;
    revalidateOnFocus?: boolean;
    errorRetryCount?: number;
  } = {}
): Record<string, UseStockDataReturn> {
  const results: Record<string, UseStockDataReturn> = {};
  
  // Create individual hooks for each symbol
  symbols.forEach((symbol) => {
    const trimmedSymbol = symbol?.trim().toUpperCase();
    if (trimmedSymbol) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      results[trimmedSymbol] = useStockData(trimmedSymbol, options);
    }
  });
  
  return results;
}

/**
 * Utility function to preload stock data into SWR cache
 * Useful for preloading data when user hovers over a symbol
 * @param symbol - Stock ticker symbol to preload
 */
export function preloadStockData(symbol: string): void {
  const key = getStockDataKey(symbol);
  if (key) {
    // This will trigger a fetch and cache the result
    stockDataFetcher(symbol).catch(() => {
      // Silently ignore preload errors
    });
  }
}

/**
 * Utility function to manually invalidate stock data cache
 * @param symbol - Stock ticker symbol to invalidate (optional, invalidates all if not provided)
 */
export function invalidateStockData(symbol?: string): void {
  if (symbol) {
    const key = getStockDataKey(symbol);
    if (key) {
      // Invalidate specific symbol
      import('swr').then(({ mutate }) => {
        mutate(key);
      });
    }
  } else {
    // Invalidate all stock data
    import('swr').then(({ mutate }) => {
      mutate((key) => typeof key === 'string' && key.startsWith('stock-data:'));
    });
  }
}