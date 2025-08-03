import { NextRequest, NextResponse } from 'next/server';
import { searchStocks } from '@/lib/services/yahooFinanceAdapter';

/**
 * GET /api/search?q=query
 * Search for stocks using Yahoo Finance live search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ results: [] });
    }

    console.log(`🔍 API Search request for: "${query}"`);

    const results = await searchStocks(query);

    console.log(`🔍 API Search returned ${results.length} results`);

    return NextResponse.json({ 
      results,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        results: []
      },
      { status: 500 }
    );
  }
}

// Export maxDuration for Vercel/Next.js
export const maxDuration = 10;