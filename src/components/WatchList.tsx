'use client';

import React from 'react';
import { X, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchList } from '@/lib/contexts';
import { useStockData } from '@/lib/hooks/useStockDataAxios';
import { WatchListItemWrapper } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TickerSearch } from './TickerSearch';

/**
 * Individual watch-list item component displaying stock data
 */
interface WatchListItemProps {
  symbol: string;
  onRemove: () => void;
  className?: string;
}

function WatchListItem({ symbol, onRemove, className }: WatchListItemProps) {
  const stockDataHook = useStockData(symbol);

  return (
    <WatchListItemWrapper
      symbol={symbol}
      hookResult={stockDataHook}
      onRemove={onRemove}
      className={className}
    >
      {(data) => {
        const latestData = data.timeSeries[0];
        const previousData = data.timeSeries[1];
        
        if (!latestData) {
          return (
            <div className="text-sm text-gray-500">
              No data available for {symbol}
            </div>
          );
        }

        const change = previousData 
          ? latestData.close - previousData.close 
          : 0;
        const changePercent = previousData 
          ? (change / previousData.close) * 100 
          : 0;
        
        const isPositive = change >= 0;

        return (
          <Card 
            className="hover:shadow-md transition-shadow"
            role="listitem"
            aria-labelledby={`stock-${symbol}-title`}
            aria-describedby={`stock-${symbol}-details`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Stock Symbol and Company Info */}
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-full bg-blue-100"
                    role="img"
                    aria-label={`${symbol} stock icon`}
                  >
                    <TrendingUp className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 id={`stock-${symbol}-title`} className="font-semibold text-gray-900">{symbol}</h3>
                      <Badge variant="secondary" className="text-xs" aria-hidden="true">
                        Stock
                      </Badge>
                    </div>
                    <p 
                      id={`stock-${symbol}-details`}
                      className="text-sm text-muted-foreground"
                    >
                      Updated: {new Date(latestData.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Price and Change */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div 
                      className="font-mono text-lg font-semibold"
                      aria-label={`Current price: ${latestData.close.toFixed(2)} dollars`}
                    >
                      ${latestData.close.toFixed(2)}
                    </div>
                    {previousData && (
                      <Badge 
                        variant={isPositive ? "default" : "destructive"}
                        className="text-xs font-medium"
                        role="status"
                        aria-label={`Price change: ${isPositive ? 'up' : 'down'} ${Math.abs(change).toFixed(2)} dollars, ${Math.abs(changePercent).toFixed(2)} percent`}
                      >
                        {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRemove}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive touch-target focus-visible"
                    title={`Remove ${symbol} from watch list`}
                    aria-label={`Remove ${symbol} from watch list`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Remove {symbol}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }}
    </WatchListItemWrapper>
  );
}



/**
 * Empty state component shown when watch list is empty
 */
function EmptyWatchList({ className }: { className?: string }) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="p-4 mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <TrendingUp className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Your watch list is empty
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        Add some stock ticker symbols to get started tracking your investments.
      </p>
    </div>
  );
}

/**
 * Main WatchList component
 */
interface WatchListProps {
  className?: string;
}

export function WatchList({ className }: WatchListProps) {
  const { watchList, addTicker, removeTicker } = useWatchList();

  const handleAddTicker = (symbol: string) => {
    addTicker(symbol);
  };

  const handleRemoveTicker = (symbol: string) => {
    removeTicker(symbol);
  };

  return (
    <Card className={cn('w-full', className)} role="region" aria-labelledby="watchlist-title">
      <CardHeader>
        <CardTitle id="watchlist-title" className="text-2xl">Watch List</CardTitle>
        <CardDescription>
          Track your favorite stocks and see real-time price updates.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Add Ticker Search */}
        <div role="group" aria-labelledby="add-stock-label">
          <label id="add-stock-label" className="sr-only">
            Add stocks to your watch list
          </label>
          <TickerSearch 
            onSelect={handleAddTicker} 
            placeholder="Search for stocks and ETFs to add..."
          />
        </div>

        {/* Watch List Items */}
        {watchList.length === 0 ? (
          <EmptyWatchList />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 
                  className="text-lg font-semibold"
                  id="watchlist-count"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Watching {watchList.length} {watchList.length === 1 ? 'stock' : 'stocks'}
                </h3>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                  aria-hidden="true"
                >
                  {watchList.length}
                </Badge>
              </div>
              <div 
                className="text-sm text-muted-foreground"
                role="status"
                aria-label="Data refresh status"
              >
                Auto-refreshing
              </div>
            </div>
            
            <Separator role="separator" aria-hidden="true" />
            
            <div 
              className="space-y-3" 
              role="list" 
              aria-labelledby="watchlist-count"
              aria-describedby="watchlist-help"
            >
              <div id="watchlist-help" className="sr-only">
                List of stocks in your watch list. Use Tab to navigate between items and Enter or Space to interact with remove buttons.
              </div>
              {watchList.map((symbol) => (
                <WatchListItem
                  key={symbol}
                  symbol={symbol}
                  onRemove={() => handleRemoveTicker(symbol)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Info Footer */}
        {watchList.length > 0 && (
          <>
            <Separator role="separator" aria-hidden="true" />
            <Card className="bg-muted/50" role="note" aria-labelledby="data-disclaimer-title">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle 
                    className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" 
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <p id="data-disclaimer-title" className="font-medium text-foreground">
                      About the data
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Stock prices are updated daily and cached for 24 hours. Data is provided by Alpha Vantage.
                      Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}