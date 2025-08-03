'use client';

import React from 'react';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchList } from '@/lib/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TickerSearch } from './TickerSearch';
import { StockCard } from './StockCard';
import { getBeginnerFriendlySuggestions } from '@/lib/data/commonStocks';

/**
 * Individual watch-list item component displaying stock data
 */
interface WatchListItemProps {
  symbol: string;
  onRemove: () => void;
  className?: string;
}

function WatchListItem({ symbol, onRemove, className }: WatchListItemProps) {
  return (
    <StockCard 
      symbol={symbol} 
      onRemove={onRemove} 
      className={cn('hover:shadow-md transition-shadow', className)}
    />
  );
}



/**
 * Educational fund suggestions component
 */
interface FundSuggestionProps {
  symbol: string;
  name: string;
  category: string;
  expenseRatio: number;
  reason: string;
  isEducational: boolean;
  onAdd: (symbol: string) => void;
}

function FundSuggestion({ symbol, name, category, expenseRatio, reason, isEducational, onAdd }: FundSuggestionProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => onAdd(symbol)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm">{symbol}</span>
              <Badge variant="default" className="text-xs">INDEX</Badge>
              {isEducational && (
                <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                  EDUCATIONAL
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground truncate mt-1">{name}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>{category}</span>
              <span>•</span>
              <span>{expenseRatio}% expense ratio</span>
            </div>
            <div className="text-xs text-muted-foreground italic mt-1">{reason}</div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state component shown when watch list is empty
 */
function EmptyWatchList({ className, onAddTicker }: { className?: string; onAddTicker: (symbol: string) => void }) {
  const [suggestions, setSuggestions] = React.useState<Array<{
    symbol: string;
    name: string;
    category: string;
    expenseRatio: number;
    reason: string;
    isEducational: boolean;
  }>>([]);

  React.useEffect(() => {
    try {
      const fundSuggestions = getBeginnerFriendlySuggestions(4);
      setSuggestions(fundSuggestions.map(s => ({
        symbol: s.symbol,
        name: s.name,
        category: s.category || 'Index Fund',
        expenseRatio: s.expenseRatio || 0,
        reason: s.reason || 'Great for beginners',
        isEducational: s.isEducational || false
      })));
    } catch (error) {
      console.warn('Error loading fund suggestions:', error);
    }
  }, []);

  return (
    <div className={cn('py-8', className)}>
      <div className="text-center mb-8">
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

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-md font-medium text-gray-900 mb-2">
              📚 Beginner-Friendly Suggestions
            </h4>
            <p className="text-sm text-gray-600">
              These educational index funds are perfect for getting started
            </p>
          </div>
          
          <div className="grid gap-3">
            {suggestions.map((suggestion) => (
              <FundSuggestion
                key={suggestion.symbol}
                symbol={suggestion.symbol}
                name={suggestion.name}
                category={suggestion.category}
                expenseRatio={suggestion.expenseRatio}
                reason={suggestion.reason}
                isEducational={suggestion.isEducational}
                onAdd={onAddTicker}
              />
            ))}
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-4">
            💡 These are low-cost, diversified funds recommended for new investors
          </div>
        </div>
      )}
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
  console.log('🔥 WatchList component rendered'); // Debug log
  const { watchList, addTicker, removeTicker } = useWatchList();

  const handleAddTicker = React.useCallback((symbol: string) => {
    addTicker(symbol);
  }, [addTicker]);

  // Expose addTicker to global scope for testing/automation
  React.useEffect(() => {
    console.log('🔥 useEffect for testAddStock running'); // Debug log
    if (typeof window !== 'undefined') {
      console.log('🔥 Setting testAddStock on window'); // Debug log
      const windowWithTest = window as typeof window & { 
        testAddStock?: (symbol: string) => void;
        testAddStockStatus?: string;
      };
      windowWithTest.testAddStock = handleAddTicker;
      windowWithTest.testAddStockStatus = 'ready'; // Debug indicator
      console.log('🔥 testAddStock set, window.testAddStock:', typeof windowWithTest.testAddStock); // Debug log
    }
  }, [handleAddTicker]);

  const handleRemoveTicker = (symbol: string) => {
    removeTicker(symbol);
  };

  return (
    <Card className={cn('w-full', className)} role="region" aria-labelledby="watchlist-title" data-testid="watchlist">
      <CardHeader>
        <CardTitle id="watchlist-title" className="text-2xl">Watch List</CardTitle>
        <CardDescription>
          Track your favorite stocks and see real-time price updates.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-component">
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
          <EmptyWatchList onAddTicker={handleAddTicker} />
        ) : (
          <div className="space-content">
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
              className="space-tight" 
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
                      Stock prices are updated daily and cached for 24 hours. Data is provided by Financial Modeling Prep.
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