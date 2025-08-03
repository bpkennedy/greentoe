import { NextRequest, NextResponse } from 'next/server';
import cacheService from '@/lib/services/cacheService';

/**
 * GET /api/cache
 * Get cache statistics and information
 */
export async function GET() {
  try {
    const stats = cacheService.getStats();
    const config = cacheService.getConfig();
    const cachedSymbols = cacheService.getCachedSymbols();

    return NextResponse.json({
      stats,
      config,
      cachedSymbols,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cache
 * Clear all cached data
 */
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');

    if (symbol) {
      // Delete specific symbol
      const deleted = cacheService.delete(symbol.toUpperCase());
      return NextResponse.json({
        message: deleted 
          ? `Cache cleared for symbol: ${symbol.toUpperCase()}` 
          : `No cache found for symbol: ${symbol.toUpperCase()}`,
        deleted
      });
    } else {
      // Clear all cache
      cacheService.clear();
      return NextResponse.json({
        message: 'All cache cleared successfully'
      });
    }
  } catch (error) {
    console.error('Cache clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cache/cleanup
 * Manually trigger cache cleanup
 */
export async function POST() {
  try {
    const removedCount = cacheService.cleanup();
    return NextResponse.json({
      message: `Cache cleanup completed. Removed ${removedCount} expired entries.`,
      removedCount
    });
  } catch (error) {
    console.error('Cache cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup cache' },
      { status: 500 }
    );
  }
}