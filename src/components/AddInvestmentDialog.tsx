'use client';

import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStockData } from '@/lib/hooks/useStockDataAxios';
import { useWatchList } from '@/lib/contexts';
import { formatCurrency } from '@/lib/utils/investmentCalculations';
import { getChartFundInfo } from '@/lib/staticData';

/**
 * Props for the AddInvestmentDialog component
 */
interface AddInvestmentDialogProps {
  /** Pre-filled symbol (e.g., from TickerSearch selection) */
  initialSymbol?: string;
  /** Callback when investment is successfully added */
  onInvestmentAdded?: (symbol: string) => void;
  /** Custom trigger button */
  trigger?: React.ReactNode;
  /** Whether dialog starts open */
  defaultOpen?: boolean;
  /** Whether to auto-close after adding */
  autoClose?: boolean;
  /** Custom CSS class */
  className?: string;
}

/**
 * Enhanced dialog for adding investments with reasoning and current price capture
 */
export function AddInvestmentDialog({
  initialSymbol = '',
  onInvestmentAdded,
  trigger,
  defaultOpen = false,
  autoClose = true,
  className
}: AddInvestmentDialogProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [reasoning, setReasoning] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [useCurrentPrice, setUseCurrentPrice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addInvestment } = useWatchList();
  const stockData = useStockData(symbol);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSymbol(initialSymbol.toUpperCase());
      setReasoning('');
      setCustomPrice('');
      setUseCurrentPrice(true);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialSymbol]);

  // Update symbol when initialSymbol changes
  useEffect(() => {
    setSymbol(initialSymbol.toUpperCase());
  }, [initialSymbol]);

  // Get current price from stock data
  const currentPrice = stockData.data?.historical[0]?.close || 0;
  const hasValidPrice = currentPrice > 0;

  // Check if this is an index fund
  const fundInfo = React.useMemo(() => {
    try {
      return symbol ? getChartFundInfo(symbol) : undefined;
    } catch {
      return undefined;
    }
  }, [symbol]);

  // Determine final price to use
  const finalPrice = useCurrentPrice ? currentPrice : parseFloat(customPrice) || 0;

  // Form validation
  const canSubmit = symbol.trim().length > 0 && 
                   reasoning.trim().length > 0 && 
                   finalPrice > 0 &&
                   !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Add investment to watchlist
      addInvestment({
        symbol: symbol.trim().toUpperCase(),
        purchasePrice: finalPrice,
        reasoning: reasoning.trim(),
        metadata: {
          tags: fundInfo ? ['index-fund'] : ['stock'],
          notes: `Added via dialog on ${new Date().toLocaleDateString()}`
        }
      });

      // Notify parent component
      onInvestmentAdded?.(symbol);

      // Auto-close if requested
      if (autoClose) {
        setIsOpen(false);
      }

      // Reset form
      setSymbol('');
      setReasoning('');
      setCustomPrice('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    setError(null);
  };

  const handlePriceToggle = (useCurrent: boolean) => {
    setUseCurrentPrice(useCurrent);
    if (useCurrent) {
      setCustomPrice('');
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Add Investment
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Add Investment to Track
          </DialogTitle>
          <DialogDescription>
            Add a stock or fund to your watchlist with your investment reasoning and track its performance over time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Symbol Input */}
          <div className="space-y-2">
            <Label htmlFor="investment-symbol">Stock Symbol</Label>
            <Input
              id="investment-symbol"
              type="text"
              value={symbol}
              onChange={handleSymbolChange}
              placeholder="e.g., AAPL, VOO, SPY"
              required
              aria-describedby="symbol-help"
            />
            <p id="symbol-help" className="text-xs text-muted-foreground">
              Enter the ticker symbol for the stock or fund you want to track
            </p>
          </div>

          {/* Stock Info Preview */}
          {symbol && (
            <Card className="border-muted bg-muted/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-1.5 rounded-full',
                      fundInfo ? 'brand-success-bg' : 'bg-blue-100'
                    )}>
                      <TrendingUp className={cn(
                        'h-3 w-3',
                        fundInfo ? 'brand-success' : 'text-blue-600'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{symbol}</span>
                        {fundInfo && (
                          <Badge variant="educational" className="text-xs">INDEX</Badge>
                        )}
                      </div>
                      {stockData.isLoading && (
                        <p className="text-xs text-muted-foreground">Loading price...</p>
                      )}
                      {stockData.error && (
                        <p className="text-xs text-red-600">Price unavailable</p>
                      )}
                      {hasValidPrice && (
                        <p className="text-xs text-muted-foreground">
                          Current: {formatCurrency(currentPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                  {fundInfo && (
                    <Badge variant="secondary" className="text-xs">
                      {fundInfo.expenseRatio}%
                    </Badge>
                  )}
                </div>
                {fundInfo && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {fundInfo.name} • {fundInfo.provider}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Purchase Price Selection */}
          <div className="space-y-3">
            <Label>Purchase Price</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="use-current-price"
                  name="price-option"
                  checked={useCurrentPrice}
                  onChange={() => handlePriceToggle(true)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="use-current-price" className="text-sm font-normal">
                  Use current market price {hasValidPrice && `(${formatCurrency(currentPrice)})`}
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="use-custom-price"
                  name="price-option"
                  checked={!useCurrentPrice}
                  onChange={() => handlePriceToggle(false)}
                  className="h-4 w-4 text-primary"
                />
                <Label htmlFor="use-custom-price" className="text-sm font-normal">
                  Enter custom price
                </Label>
              </div>
              {!useCurrentPrice && (
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-32 ml-6"
                  aria-label="Custom purchase price"
                />
              )}
            </div>
          </div>

          {/* Investment Reasoning */}
          <div className="space-y-2">
            <Label htmlFor="investment-reasoning">Investment Reasoning</Label>
            <Textarea
              id="investment-reasoning"
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              placeholder="Why are you interested in this investment? What's your thesis?"
              rows={3}
              required
              aria-describedby="reasoning-help"
            />
            <p id="reasoning-help" className="text-xs text-muted-foreground">
              Explain your investment logic - this will help you track your decision-making over time
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Final Price Preview */}
          {finalPrice > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg border border-muted">
              <p className="text-sm font-medium">
                Tracking Price: {formatCurrency(finalPrice)}
              </p>
              <p className="text-xs text-muted-foreground">
                Performance will be calculated from this price
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Investment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}