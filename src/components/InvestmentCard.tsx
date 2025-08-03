'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Calendar,
  DollarSign,
  Target,
  Edit3,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import type { FMPProcessedStockData } from '@/lib/types/financialModelingPrep';
import type { InvestmentEntry } from '@/lib/types/investment';
import { 
  calculatePerformance, 
  formatCurrency, 
  formatGainLoss, 
  formatPercentage, 
  getPerformanceTrend 
} from '@/lib/utils/investmentCalculations';
import { getChartFundInfo } from '@/lib/staticData';

/**
 * Props for the InvestmentCard component
 */
interface InvestmentCardProps {
  /** Investment entry with tracking data */
  investment: InvestmentEntry;
  /** Whether the card starts expanded */
  defaultExpanded?: boolean;
  /** Callback when remove button is clicked */
  onRemove?: () => void;
  /** Callback when investment reasoning is updated */
  onUpdateReasoning?: (symbol: string, reasoning: string) => void;
  /** Custom CSS class */
  className?: string;
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}

/**
 * Investment summary with performance tracking
 */
interface InvestmentSummaryProps {
  investment: InvestmentEntry;
  data: FMPProcessedStockData;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}

function InvestmentSummary({ 
  investment, 
  data, 
  isExpanded, 
  onToggle, 
  onRemove 
}: InvestmentSummaryProps) {
  // Check if this is an index fund
  const fundInfo = useMemo(() => {
    try {
      return getChartFundInfo(investment.symbol);
    } catch {
      return undefined;
    }
  }, [investment.symbol]);

  const latestData = data.historical[0];
  const previousData = data.historical[1];
  
  // Calculate investment performance
  const performance = useMemo(() => {
    if (!latestData || investment.purchasePrice <= 0) return null;
    return calculatePerformance(investment, latestData.close);
  }, [investment, latestData]);

  if (!latestData) {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{investment.symbol}</h3>
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${investment.symbol} chart`}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Current stock performance (day-to-day)
  const change = previousData ? latestData.close - previousData.close : 0;
  const changePercent = previousData ? calculatePercentageChange(latestData.close, previousData.close) : 0;
  const isPositive = change >= 0;
  
  // Investment performance (since purchase)
  const investmentTrend = performance ? getPerformanceTrend(performance.gainLossPercentage) : 'neutral';
  
  // Determine icon based on investment performance if available, otherwise daily performance
  const trend = performance ? investmentTrend : (Math.abs(changePercent) > 0.1 ? (isPositive ? 'up' : 'down') : 'neutral');

  const TrendIcon = trend === 'up' ? TrendingUp : 
                   trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="flex items-center justify-between p-4">
      {/* Stock Info */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-full',
          trend === 'up' ? 'brand-success-bg' : 
          trend === 'down' ? 'bg-red-100' : 'bg-muted'
        )}>
          <TrendIcon className={cn(
            'h-4 w-4',
            trend === 'up' ? 'brand-success' : 
            trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
          )} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{investment.symbol}</h3>
            <Badge 
              variant={fundInfo ? "default" : "outline"} 
              className="text-xs"
            >
              {fundInfo ? "INDEX" : "STOCK"}
            </Badge>
            {fundInfo && (
              <Badge variant="secondary" className="text-xs font-mono">
                {fundInfo.expenseRatio}%
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {fundInfo ? `${fundInfo.provider} • ` : ""}Added: {new Date(investment.dateAdded).toLocaleDateString()}
          </p>
          {fundInfo && (
            <p className="text-xs brand-green mt-1">
              {fundInfo.category} • {fundInfo.keyFacts[0]}
            </p>
          )}
        </div>
      </div>

      {/* Price and Performance */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">
              {formatCurrency(latestData.close)}
            </span>
            {change !== 0 && (
              <Badge 
                variant={isPositive ? "success" : "destructive"} 
                className="text-xs font-mono"
              >
                {formatGainLoss(change)} ({formatPercentage(changePercent)})
              </Badge>
            )}
          </div>

          {/* Investment Performance */}
          {performance && (
            <div className="mt-1">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-muted-foreground">Your gain/loss:</span>
                <span className={cn(
                  'font-medium',
                  performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatGainLoss(performance.gainLoss)}
                </span>
                <span className={cn(
                  'text-xs',
                  performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  ({formatPercentage(performance.gainLossPercentage)})
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                From {formatCurrency(investment.purchasePrice)} on {new Date(investment.dateAdded).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* No performance data available */}
          {!performance && investment.purchasePrice <= 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              No purchase price set
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${investment.symbol} details`}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Remove ${investment.symbol} from watch list`}
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * InvestmentCard component with expandable details and performance tracking
 */
export function InvestmentCard({ 
  investment, 
  defaultExpanded = false, 
  onRemove,
  onUpdateReasoning,
  className 
}: InvestmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const stockDataHook = useStockData(investment.symbol);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <Card className={cn('transition-all duration-200', className)} data-testid={`investment-card-${investment.symbol}`}>
      <StockDataWrapper
        symbol={investment.symbol}
        hookResult={stockDataHook}
        onRemove={onRemove}
        className="min-h-0"
      >
        {(data) => (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <div 
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-lg"
                data-testid={`investment-card-trigger-${investment.symbol}`}
              >
                <InvestmentSummary
                  investment={investment}
                  data={data}
                  isExpanded={isExpanded}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4">
              <div className="px-4 pb-4">
                <Separator className="mb-4" />
                
                {/* Investment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Investment Summary */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Investment Details
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date Added:</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(investment.dateAdded).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Purchase Price:</span>
                        <span className="flex items-center gap-1 font-mono">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(investment.purchasePrice)}
                        </span>
                      </div>

                      {investment.metadata?.tags && investment.metadata.tags.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tags:</span>
                          <div className="flex gap-1">
                            {investment.metadata.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Performance Summary */}
                  {investment.purchasePrice > 0 && data.historical[0] && (
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Performance Summary
                      </h4>
                      
                      {(() => {
                        const performance = calculatePerformance(investment, data.historical[0].close);
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Current Price:</span>
                              <span className="font-mono">{formatCurrency(performance.currentPrice)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Gain/Loss:</span>
                              <span className={cn(
                                'font-mono font-medium',
                                performance.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                {formatGainLoss(performance.gainLoss)} ({formatPercentage(performance.gainLossPercentage)})
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Days Held:</span>
                              <span>{performance.daysSinceAdded} days</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Investment Reasoning */}
                <div className="mb-4">
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Edit3 className="h-4 w-4 text-primary" />
                    Investment Reasoning
                  </h4>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {investment.reasoning}
                    </AlertDescription>
                  </Alert>
                  
                  {onUpdateReasoning && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        const newReasoning = window.prompt('Update your investment reasoning:', investment.reasoning);
                        if (newReasoning && newReasoning.trim() !== investment.reasoning) {
                          onUpdateReasoning(investment.symbol, newReasoning.trim());
                        }
                      }}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Update Reasoning
                    </Button>
                  )}
                </div>

                {/* Chart */}
                <StockChart 
                  data={data}
                  height={250}
                  showMetrics={false}
                  className="border-0 shadow-none"
                />
                
                {/* Quick Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {data.historical.length} data points available
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://finance.yahoo.com/quote/${investment.symbol}`, '_blank')}
                      className="text-xs"
                      data-testid={`view-details-${investment.symbol}`}
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