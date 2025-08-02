import { NextRequest, NextResponse } from 'next/server';
import { fetchStockData } from '@/lib/api/alphaVantage';

/**
 * GET /api/stock/[symbol]
 * Fetches stock data for the given symbol
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    
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

  } catch (error: any) {
    // Return the error in the same format as our StockError type
    const statusCode = error.type === 'RATE_LIMITED' ? 429 :
                      error.type === 'INVALID_SYMBOL' ? 400 :
                      error.type === 'API_KEY_ERROR' ? 401 : 500;

    return NextResponse.json(error, { status: statusCode });
  }
}