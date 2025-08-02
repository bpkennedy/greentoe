/**
 * TypeScript interfaces for Alpha Vantage API responses and related data types
 * Based on Alpha Vantage TIME_SERIES_DAILY endpoint format (2024-2025)
 */

// Raw API response structure from Alpha Vantage
export interface AlphaVantageMetaData {
  '1. Information': string;
  '2. Symbol': string;
  '3. Last Refreshed': string;
  '4. Output Size': string;
  '5. Time Zone': string;
}

export interface AlphaVantageDailyData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

export interface AlphaVantageTimeSeriesDaily {
  [date: string]: AlphaVantageDailyData;
}

export interface AlphaVantageSuccessResponse {
  'Meta Data': AlphaVantageMetaData;
  'Time Series (Daily)': AlphaVantageTimeSeriesDaily;
}

// Error response structures
export interface AlphaVantageRateLimitError {
  Note: string;
}

export interface AlphaVantageErrorResponse {
  'Error Message': string;
}

// Union type for all possible API responses
export type AlphaVantageApiResponse = 
  | AlphaVantageSuccessResponse 
  | AlphaVantageRateLimitError 
  | AlphaVantageErrorResponse;

// Processed/normalized data structures for use in the app
export interface StockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockMetadata {
  symbol: string;
  lastRefreshed: string;
  timeZone: string;
  outputSize: string;
}

export interface ProcessedStockData {
  metadata: StockMetadata;
  timeSeries: StockDataPoint[];
}

// Error types for the processed data
export interface StockDataError {
  type: 'RATE_LIMIT' | 'INVALID_SYMBOL' | 'API_ERROR' | 'NETWORK_ERROR';
  message: string;
  canRetry: boolean;
}

// SWR hook return types
export interface UseStockDataReturn {
  data: ProcessedStockData | undefined;
  error: StockDataError | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
}