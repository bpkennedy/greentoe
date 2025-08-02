'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import dynamic from 'next/dynamic';

// Lazy load charts since they're only shown when expanded
const StockChart = dynamic(
  () => import('./StockChart').then(mod => ({ default: mod.StockChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
  }
);
import { useStockData } from '@/lib/hooks/useStockDataAxios';
import { StockDataWrapper } from '@/components/ui';
import type { ProcessedStockData } from '@/lib/types/alphaVantage';

/**
 * Props for the StockCard component
 */
interface StockCardProps {
  /** Stock ticker symbol */
  symbol: string;
  /** Whether the card starts expanded */
  defaultExpanded?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Compact stock summary component for collapsed state
 */
interface StockSummaryProps {
  symbol: string;
  data: ProcessedStockData;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}

function StockSummary({ symbol, data, isExpanded, onToggle, onRemove }: StockSummaryProps) {
  const latestData = data.timeSeries[0];
  const previousData = data.timeSeries[1];
  
  if (!latestData) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${symbol} chart`}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  const change = previousData ? latestData.close - previousData.close : 0;
  const changePercent = previousData ? calculatePercentageChange(latestData.close, previousData.close) : 0;
  const isPositive = change >= 0;
  
  // Determine trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (Math.abs(changePercent) > 0.1) {
    trend = isPositive ? 'up' : 'down';
  }

  const TrendIcon = trend === 'up' ? TrendingUp : 
                   trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between p-4">
      {/* Stock Info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-full',
          trend === 'up' ? 'bg-green-100' : 
          trend === 'down' ? 'bg-red-100' : 'bg-muted'
        )}>
          <TrendIcon className={cn(
            'h-4 w-4',
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{symbol}</h3>
            <Badge variant="outline" className="text-xs">
              Stock
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Updated: {new Date(latestData.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Price and Controls */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-mono text-lg font-semibold">
            ${latestData.close.toFixed(2)}
          </div>
          {previousData && (
            <Badge 
              variant={isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Expand/Collapse Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${symbol} chart`}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Remove Button */}
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${symbol} from watch list`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * StockCard component with expandable chart view
 */
export function StockCard({ 
  symbol, 
  defaultExpanded = false, 
  onRemove, 
  className 
}: StockCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const stockDataHook = useStockData(symbol);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Card className={cn('transition-all duration-200', className)} data-testid={`stock-card-${symbol}`}>
      <StockDataWrapper
        symbol={symbol}
        hookResult={stockDataHook}
        onRemove={onRemove}
        className="min-h-0"
      >
        {(data) => (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <div 
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                data-testid={`stock-card-trigger-${symbol}`}
              >
                <StockSummary
                  symbol={symbol}
                  data={data}
                  isExpanded={isExpanded}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
              <div className="px-4 pb-4">
                <Separator className="mb-4" />
                <StockChart 
                  data={data}
                  height={250}
                  showMetrics={false}
                  className="border-0 shadow-none"
                />
                
                {/* Quick Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {data.timeSeries.length} data points available
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://finance.yahoo.com/quote/${symbol}`, '_blank')}
                      className="text-xs"
                      data-testid={`view-details-${symbol}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </StockDataWrapper>
    </Card>
  );
}

/**
 * Compact version for use in dense layouts
 */
export function CompactStockCard({ symbol, onRemove, className }: StockCardProps) {
  return (
    <StockCard 
      symbol={symbol}
      defaultExpanded={false}
      onRemove={onRemove}
      className={cn('hover:shadow-md', className)}
    />
  );
}

/**
 * Expanded version that starts open
 */
export function ExpandedStockCard({ symbol, onRemove, className }: StockCardProps) {
  return (
    <StockCard 
      symbol={symbol}
      defaultExpanded={true}
      onRemove={onRemove}
      className={cn('shadow-md', className)}
    />
  );
}