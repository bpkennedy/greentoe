// FMP API Response Types
export interface FMPHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose?: number;
  volume: number;
  unadjustedVolume?: number;
  change?: number;
  changePercent?: number;
  vwap?: number;
  label?: string;
  changeOverTime?: number;
}

export interface FMPHistoricalResponse {
  symbol: string;
  historical: FMPHistoricalData[];
}

// Error response structures
export interface FMPErrorResponse {
  'Error Message': string;
}

// Union type for all possible API responses
export type FMPApiResponse = FMPHistoricalResponse | FMPErrorResponse;

// Processed data types
export interface FMPStockDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

export interface FMPProcessedStockData {
  symbol: string;
  historical: FMPStockDataPoint[];
  dataPoints: number;
}

// Error types
export interface FMPStockDataError {
  type: 'NETWORK_ERROR' | 'RATE_LIMIT' | 'INVALID_SYMBOL' | 'API_ERROR';
  message: string;
  canRetry: boolean;
}