import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/services/yahooFinanceAdapter';
import cacheService from '@/lib/services/cacheService';
import type { FMPStockDataError } from '@/lib/types/financialModelingPrep';

// Request deduplication map to prevent concurrent requests for same symbol
const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * GET /api/stock/[symbol]
 * Fetches stock data for the given symbol with cache-first strategy and request deduplication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    
    if (!symbol) {
      return NextResponse.json(
        {
          type: 'INVALID_SYMBOL',
          message: 'Stock symbol is required',
          canRetry: false
        },
        { status: 400 }
      );
    }

    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Step 1: Check cache first
    const cachedData = cacheService.get(cleanSymbol);
    if (cachedData) {
      console.log(`Serving cached data for ${cleanSymbol}`);
      return NextResponse.json(cachedData);
    }

    // Step 2: Check for pending request to avoid duplicate API calls
    const requestKey = `stock:${cleanSymbol}`;
    if (pendingRequests.has(requestKey)) {
      console.log(`Waiting for pending request for ${cleanSymbol}`);
      try {
        const pendingData = await pendingRequests.get(requestKey);
        return NextResponse.json(pendingData);
      } catch {
        // If pending request failed, we'll make a new one below
        pendingRequests.delete(requestKey);
      }
    }

    // Step 3: Make new request with deduplication
    const dataPromise = (async () => {
      try {
        console.log(`Fetching fresh data for ${cleanSymbol} from Yahoo Finance`);
        const stockData = await fetchStockData(cleanSymbol);
        
        // Cache the successful response
        cacheService.set(cleanSymbol, stockData);
        
        return stockData;
      } finally {
        // Always clean up pending request
        pendingRequests.delete(requestKey);
      }
    })();

    // Store the promise to prevent duplicate requests
    pendingRequests.set(requestKey, dataPromise);
    
    const stockData = await dataPromise;
    return NextResponse.json(stockData);

  } catch (error: unknown) {
    console.error('Stock API Error:', JSON.stringify(error, null, 2));
    
    // Return the error in the same format as our StockError type
    const stockError = error as FMPStockDataError;
    const statusCode = stockError.type === 'RATE_LIMIT' ? 429 :
                      stockError.type === 'INVALID_SYMBOL' ? 400 :
                      stockError.type === 'API_ERROR' ? 401 : 500;

    return NextResponse.json(stockError, { status: statusCode });
  }
}