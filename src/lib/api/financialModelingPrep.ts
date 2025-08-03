import type {
  FMPHistoricalData,
  FMPProcessedStockData,
  FMPStockDataError,
  FMPStockDataPoint,
  FMPErrorResponse,
} from '../types/financialModelingPrep';

/**
 * Get API key from environment variables
 */
function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error('FMP API key is required. Please set FMP_API_KEY in your environment variables.');
  }
  return apiKey;
}

/**
 * Create a FMPStockDataError from various error conditions
 */
function createStockError(type: FMPStockDataError['type'], message: string, canRetry: boolean = false): FMPStockDataError {
  const error = new Error(message) as Error & FMPStockDataError;
  error.type = type;
  error.message = message;
  error.canRetry = canRetry;
  return error;
}

/**
 * Check if response is an error response
 */
function isErrorResponse(response: unknown): response is FMPErrorResponse {
  return typeof response === 'object' && response !== null && 'Error Message' in response;
}

/**
 * Convert FMP data point to our standard format
 */
function convertDataPoint(item: FMPHistoricalData): FMPStockDataPoint {
  return {
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    adjClose: item.adjClose || item.close,
    volume: item.volume,
    unadjustedVolume: item.unadjustedVolume || item.volume,
    change: item.change || 0,
    changePercent: item.changePercent || 0,
    vwap: item.vwap || item.close,
    label: item.label || `${item.date}`,
    changeOverTime: item.changeOverTime || 0
  };
}

/**
 * Process FMP API response into our standard format
 */
function processStockData(data: FMPHistoricalData[], symbol: string): FMPProcessedStockData {
  // Sort data by date (newest first)
  const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Convert all data points
  const processedData = sortedData.map(convertDataPoint);
  
  return {
    symbol: symbol.toUpperCase(),
    historical: processedData,
    dataPoints: processedData.length
  };
}

/**
 * Fetch stock data from Financial Modeling Prep
 */
export async function fetchStockData(symbol: string): Promise<FMPProcessedStockData> {
  try {
    const apiKey = getApiKey();
    const baseUrl = 'https://financialmodelingprep.com/api/v3';
    
    // Use the Daily Chart EOD API endpoint
    const url = `${baseUrl}/historical-price-full/${symbol.toUpperCase()}?apikey=${apiKey}`;
    
    console.log(`Fetching FMP data for ${symbol} from: ${url.replace(apiKey, '[API_KEY]')}`);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'greentoe-stock-app/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw createStockError('RATE_LIMIT', 'API rate limit exceeded. Please try again later.', true);
      }
      if (response.status === 401 || response.status === 403) {
        throw createStockError('API_ERROR', 'Invalid API key or insufficient permissions.');
      }
      throw createStockError('NETWORK_ERROR', `HTTP ${response.status}: ${response.statusText}`, true);
    }

    const data = await response.json();
    console.log('Raw FMP response structure:', {
      type: typeof data,
      isArray: Array.isArray(data),
      keys: typeof data === 'object' ? Object.keys(data) : 'N/A',
      hasSymbol: 'symbol' in data,
      hasHistorical: 'historical' in data
    });

    // Handle different response formats
    if (isErrorResponse(data)) {
      throw createStockError('INVALID_SYMBOL', data['Error Message']);
    }

    // FMP returns data in { symbol, historical } format
    if (data.symbol && data.historical && Array.isArray(data.historical)) {
      if (data.historical.length === 0) {
        throw createStockError('INVALID_SYMBOL', `No data found for symbol: ${symbol}`);
      }
      
      const processedData = processStockData(data.historical, data.symbol);
      return processedData;
    }

    // If we get here, the response format is unexpected
    console.error('Unexpected FMP response format:', JSON.stringify(data, null, 2));
    throw createStockError('API_ERROR', 'Unexpected API response format. Check console for details.');

  } catch (error) {
    console.error('Error in fetchStockData:', JSON.stringify(error, null, 2));
    
    // Handle fetch errors (network issues, timeouts, etc.)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw createStockError('NETWORK_ERROR', 'Request timeout. Please check your connection.', true);
      }
      
      if (error.message.includes('FMP API key')) {
        throw createStockError('API_ERROR', error.message);
      }
      
      // Re-throw FMPStockDataError as-is
      if ('type' in error && 'canRetry' in error && 
          typeof (error as FMPStockDataError).type === 'string' && 
          typeof (error as FMPStockDataError).canRetry === 'boolean') {
        throw error;
      }
    }

    // Generic network error
    throw createStockError('NETWORK_ERROR', 'Failed to fetch stock data. Please check your connection.', true);
  }
}

/**
 * Health check for the FMP API
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Try to fetch a simple profile for Apple (a stock that should always exist)
    const apiKey = getApiKey();
    const url = `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${apiKey}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    return response.ok;
  } catch (error) {
    console.error('FMP API health check failed:', error);
    return false;
  }
}