'use client';

import React from 'react';
import { AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWatchList } from '@/lib/contexts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { TickerSearch } from './TickerSearch';

import { InvestmentCard } from './InvestmentCard';
import { AddInvestmentDialog } from './AddInvestmentDialog';
import { getBeginnerFriendlySuggestions } from '@/lib/data/commonStocks';
import type { InvestmentEntry } from '@/lib/types/investment';

/**
 * Individual watch-list item component displaying investment data
 */
interface WatchListItemProps {
  investment: InvestmentEntry;
  onRemove: () => void;
  onUpdateReasoning?: (symbol: string, reasoning: string) => void;
  className?: string;
}

function WatchListItem({ investment, onRemove, onUpdateReasoning, className }: WatchListItemProps) {
  return (
    <InvestmentCard 
      investment={investment} 
      onRemove={onRemove}
      onUpdateReasoning={onUpdateReasoning}
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
                          <Badge variant="educational" className="text-xs">
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
                          <TrendingUp className="h-4 w-4 brand-green" />
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
  const { watchList, addTicker, removeInvestment, updateInvestmentReasoning } = useWatchList();
  const [selectedSymbolForDialog, setSelectedSymbolForDialog] = React.useState<string>('');
  const [showAddDialog, setShowAddDialog] = React.useState(false);

  const handleAddTicker = React.useCallback((symbol: string) => {
    // For legacy compatibility and quick add functionality
    addTicker(symbol);
  }, [addTicker]);

  const handleAddInvestment = React.useCallback((symbol: string) => {
    // Open dialog for detailed investment tracking
    console.log('🔥 handleAddInvestment called with symbol:', symbol);
    console.log('🔥 Current showAddDialog state:', showAddDialog);
    setSelectedSymbolForDialog(symbol);
    setShowAddDialog(true);
    console.log('🔥 Set showAddDialog to true and selectedSymbolForDialog to:', symbol);
  }, [showAddDialog]);

  const handleTickerSearchSelect = React.useCallback((symbol: string) => {
    // When user selects from TickerSearch, use the enhanced dialog
    console.log('🔥 TickerSearch selected symbol:', symbol);
    handleAddInvestment(symbol);
  }, [handleAddInvestment]);

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
    // Use the new removeInvestment method for enhanced tracking
    removeInvestment(symbol);
  };

  const handleInvestmentAdded = () => {
    setShowAddDialog(false);
    setSelectedSymbolForDialog('');
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
            onSelect={handleTickerSearchSelect} 
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
              {watchList.map((investment) => (
                <WatchListItem
                  key={investment.symbol}
                  investment={investment}
                  onRemove={() => handleRemoveTicker(investment.symbol)}
                  onUpdateReasoning={updateInvestmentReasoning}
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
                      Stock prices are updated daily and cached for 60 minutes. Data is provided by Yahoo Finance.
                      Past performance does not guarantee future results.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prominent Add Investment CTA */}
            <div className="text-center pt-6 pb-2">
              <AddInvestmentDialog
                onInvestmentAdded={handleInvestmentAdded}
                onClose={() => {
                  console.log('🔥 CTA Dialog closed, resetting state');
                  setShowAddDialog(false);
                  setSelectedSymbolForDialog('');
                }}
                autoClose={true}
                trigger={
                  <Button 
                    size="lg" 
                    className="gap-3 bg-gradient-to-r from-primary via-primary to-blue-600 hover:from-primary/90 hover:via-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base px-8 py-6 rounded-xl border-0 group"
                  >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                    Add Investment
                    <span className="opacity-75 text-sm font-normal ml-1">to Portfolio</span>
                  </Button>
                }
              />
              <p className="text-xs text-muted-foreground mt-3">
                ✨ Track performance, set alerts, and learn from your investments
              </p>
            </div>
          </>
        )}
      </CardContent>

      {/* Add Investment Dialog */}
      <AddInvestmentDialog
        initialSymbol={selectedSymbolForDialog}
        defaultOpen={showAddDialog}
        onInvestmentAdded={handleInvestmentAdded}
        onClose={() => {
          console.log('🔥 Dialog closed, resetting state');
          setShowAddDialog(false);
          setSelectedSymbolForDialog('');
        }}
        autoClose={true}
      />
    </Card>
  );
}