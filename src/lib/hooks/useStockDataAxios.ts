import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { StockData, StockError } from '@/lib/types/alphaVantage';

interface UseStockDataResult {
  data: StockData | null;
  error: StockError | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching stock data using axios
 * Provides predictable, easy-to-reason-about HTTP requests
 */
export function useStockData(symbol: string): UseStockDataResult {
  const [data, setData] = useState<StockData | null>(null);
  const [error, setError] = useState<StockError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

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
            details: 'Unable to reach the server'
          });
        } else {
          // Request setup error
          setError({
            type: 'API_ERROR',
            message: 'Request configuration error',
            details: err.message
          });
        }
      } else {
        // Non-axios error
        setError({
          type: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: err instanceof Error ? err.message : 'Unknown error'
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
    refetch: fetchData
  };
}