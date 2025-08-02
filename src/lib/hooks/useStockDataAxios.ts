import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { ProcessedStockData, StockDataError, UseStockDataReturn } from '@/lib/types/alphaVantage';

/**
 * Custom hook for fetching stock data using axios
 * Provides predictable, easy-to-reason-about HTTP requests
 */
export function useStockData(symbol: string): UseStockDataReturn {
  const [data, setData] = useState<ProcessedStockData | undefined>(undefined);
  const [error, setError] = useState<StockDataError | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const response = await axios.get(`/api/stock/${symbol}`);
      setData(response.data);
    } catch (err) {
      // Handle axios errors
      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          // API returned an error response
          setError(err.response.data);
        } else if (err.request) {
          // Network error
          setError({
            type: 'NETWORK_ERROR',
            message: 'Network error occurred. Please check your connection.',
            canRetry: true
          });
        } else {
          // Request setup error
          setError({
            type: 'API_ERROR',
            message: 'Request configuration error',
            canRetry: false
          });
        }
      } else {
        // Non-axios error
        setError({
          type: 'API_ERROR',
          message: 'An unexpected error occurred',
          canRetry: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Fetch data when symbol changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating: isLoading, // Map isLoading to isValidating for SWR compatibility
    mutate: fetchData // Map refetch to mutate for SWR compatibility
  };
}