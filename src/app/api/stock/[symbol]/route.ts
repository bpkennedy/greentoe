import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/api/alphaVantage';

/**
 * GET /api/stock/[symbol]
 * Fetches stock data for the given symbol
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
          details: 'Please provide a valid stock symbol'
        },
        { status: 400 }
      );
    }

    const stockData = await fetchStockData(symbol);
    return NextResponse.json(stockData);

  } catch (error: unknown) {
    // Return the error in the same format as our StockError type
    const stockError = error as { type?: string; message?: string; details?: string };
    const statusCode = stockError.type === 'RATE_LIMITED' ? 429 :
                      stockError.type === 'INVALID_SYMBOL' ? 400 :
                      stockError.type === 'API_KEY_ERROR' ? 401 : 500;

    return NextResponse.json(stockError, { status: statusCode });
  }
}