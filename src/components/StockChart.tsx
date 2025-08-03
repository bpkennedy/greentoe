'use client';

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, DollarSign, Info, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { FMPProcessedStockData, FMPStockDataPoint } from '@/lib/types/financialModelingPrep';
import { getChartFundInfo } from '@/lib/staticData';

/**
 * Props for the StockChart component
 */
interface StockChartProps {
  /** Stock data to display */
  data: FMPProcessedStockData;
  /** Height of the chart in pixels */
  height?: number;
  /** Whether to show the detailed metrics panel */
  showMetrics?: boolean;
  /** Custom CSS class */
  className?: string;
}

/**
 * Custom tooltip component for the chart
 */
interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
  }>;
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length && label) {
    const value = payload[0].value;
    const date = new Date(label).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{date}</p>
        <p className="text-sm text-muted-foreground">
          Close: <span className="font-mono font-semibold">${value.toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format large numbers with appropriate suffixes
 */
function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(1)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}

/**
 * Fund Information Panel Component
 */
interface FundInfoPanelProps {
  symbol: string;
  className?: string;
}

function FundInfoPanel({ symbol, className }: FundInfoPanelProps) {
  const fundInfo = useMemo(() => {
    try {
      return getChartFundInfo(symbol);
    } catch (error) {
      console.warn('Error getting fund info for', symbol, error);
      return undefined;
    }
  }, [symbol]);

  if (!fundInfo) {
    return null;
  }

  return (
    <Card className={cn('mt-4 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Index Fund Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-emerald-700">Fund Details</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provider:</span>
                <span className="font-medium">{fundInfo.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">{fundInfo.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expense Ratio:</span>
                <Badge variant="secondary" className="font-mono">
                  {fundInfo.expenseRatio}%
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3 w-3 text-emerald-600" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-700">Key Facts</span>
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {fundInfo.keyFacts.slice(0, 3).map((fact, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {fundInfo.keyFacts.length > 3 && (
          <details className="text-sm">
            <summary className="cursor-pointer text-emerald-700 hover:text-emerald-800 font-medium">
              View all key facts ({fundInfo.keyFacts.length})
            </summary>
            <ul className="mt-2 space-y-1 text-muted-foreground pl-4">
              {fundInfo.keyFacts.slice(3).map((fact, index) => (
                <li key={index + 3} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="pt-2 border-t border-emerald-200">
          <p className="text-xs text-emerald-600 italic">
            💡 Index funds offer low-cost, diversified exposure to market segments
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main StockChart component displaying price history and metrics
 */
export function StockChart({ 
  data, 
  height = 300, 
  showMetrics = true, 
  className 
}: StockChartProps) {
  // Prepare chart data (reverse to show oldest to newest)
  const chartData = useMemo(() => {
    if (!data.historical || data.historical.length === 0) {
      return [];
    }
    return [...data.historical]
      .reverse()
      .map((point: FMPStockDataPoint) => ({
        date: point.date,
        price: point.close,
        volume: point.volume
      }));
  }, [data.historical]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    if (!data.historical || data.historical.length === 0) {
      return {
        currentPrice: 0,
        previousPrice: 0,
        change: 0,
        changePercent: 0,
        high52Week: 0,
        low52Week: 0,
        avgVolume: 0,
        isPositive: false,
        trend: 'neutral' as const
      };
    }

    const latest = data.historical[0];
    const previous = data.historical[1];
    const currentPrice = latest.close;
    const previousPrice = previous?.close || currentPrice;
    
    const change = currentPrice - previousPrice;
    const changePercent = calculatePercentageChange(currentPrice, previousPrice);
    const isPositive = change >= 0;

    // Calculate 52-week high/low
    const prices = data.historical.map(d => d.close);
    const high52Week = Math.max(...prices);
    const low52Week = Math.min(...prices);

    // Calculate average volume
    const volumes = data.historical.map(d => d.volume);
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

    // Determine trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (Math.abs(changePercent) > 0.1) {
      trend = isPositive ? 'up' : 'down';
    }

    return {
      currentPrice,
      previousPrice,
      change,
      changePercent,
      high52Week,
      low52Week,
      avgVolume,
      isPositive,
      trend
    };
  }, [data.historical]);

  // Calculate min/max for chart domain with padding
  const priceRange = useMemo(() => {
    const prices = chartData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1; // 10% padding
    return {
      min: Math.max(0, min - padding),
      max: max + padding
    };
  }, [chartData]);

  if (!data.historical || data.historical.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No chart data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = metrics.trend === 'up' ? TrendingUp : 
                   metrics.trend === 'down' ? TrendingDown : Minus;

  return (
    <Card 
      className={className}
      role="region"
      aria-labelledby={`chart-title-${data.symbol}`}
      aria-describedby={`chart-description-${data.symbol}`}
      data-testid={`stock-chart-${data.symbol}`}
    >
      {showMetrics && (
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle 
                id={`chart-title-${data.symbol}`}
                className="flex items-center gap-2"
              >
                <TrendIcon 
                  className={cn(
                    'h-5 w-5',
                    metrics.trend === 'up' ? 'text-green-600' : 
                    metrics.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                {data.symbol} Stock Chart
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.dataPoints} data points available
              </p>
            </div>
            <div className="text-right">
              <div 
                className="font-mono text-2xl font-bold"
                aria-label={`Current price: ${metrics.currentPrice.toFixed(2)} dollars`}
              >
                ${metrics.currentPrice.toFixed(2)}
              </div>
              <Badge 
                variant={metrics.isPositive ? "default" : "destructive"}
                className="mt-1"
                role="status"
                aria-label={`Price change: ${metrics.isPositive ? 'up' : 'down'} ${Math.abs(metrics.change).toFixed(2)} dollars, ${Math.abs(metrics.changePercent).toFixed(2)} percent`}
              >
                {metrics.isPositive ? '+' : ''}{metrics.change.toFixed(2)} 
                ({metrics.changePercent.toFixed(2)}%)
              </Badge>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="pb-6">
        {/* Chart Description for Screen Readers */}
        <div id={`chart-description-${data.symbol}`} className="sr-only">
          Line chart showing {data.symbol} stock price over the past 30 days. 
          Current price is ${metrics.currentPrice.toFixed(2)}, 
          {metrics.isPositive ? 'up' : 'down'} {Math.abs(metrics.changePercent).toFixed(2)}% 
          from previous close. Chart shows price range from ${priceRange.min.toFixed(2)} to ${priceRange.max.toFixed(2)} dollars.
        </div>

        {/* Chart */}
        <div 
          className="mb-6" 
          style={{ height }}
          role="img"
          aria-labelledby={`chart-title-${data.symbol}`}
          aria-describedby={`chart-description-${data.symbol}`}
          tabIndex={0}
          data-testid={`chart-container-${data.symbol}`}
          onKeyDown={(e) => {
            // Allow keyboard navigation hint
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              // Focus could be managed here for deeper chart interaction
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                }}
                className="text-muted-foreground"
              />
              <YAxis 
                domain={[priceRange.min, priceRange.max]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                className="text-muted-foreground"
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine 
                y={metrics.previousPrice} 
                stroke="#6b7280" 
                strokeDasharray="2 2"
                strokeOpacity={0.5}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={metrics.isPositive ? '#16a34a' : '#dc2626'}
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: metrics.isPositive ? '#16a34a' : '#dc2626',
                  strokeWidth: 2,
                  stroke: '#ffffff'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Metrics */}
        {showMetrics && (
          <>
            <Separator className="mb-4" role="separator" aria-hidden="true" />
            <div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              role="list"
              aria-label="Key stock metrics"
              data-testid={`chart-metrics-${data.symbol}`}
            >
              <div className="text-center" role="listitem">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" aria-hidden="true" />
                  <span id={`${data.symbol}-52w-high-label`}>52W High</span>
                </div>
                <div 
                  className="font-mono font-semibold"
                  aria-labelledby={`${data.symbol}-52w-high-label`}
                  aria-label={`52 week high: ${metrics.high52Week.toFixed(2)} dollars`}
                >
                  ${metrics.high52Week.toFixed(2)}
                </div>
              </div>
              
              <div className="text-center" role="listitem">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-3 w-3" aria-hidden="true" />
                  <span id={`${data.symbol}-52w-low-label`}>52W Low</span>
                </div>
                <div 
                  className="font-mono font-semibold"
                  aria-labelledby={`${data.symbol}-52w-low-label`}
                  aria-label={`52 week low: ${metrics.low52Week.toFixed(2)} dollars`}
                >
                  ${metrics.low52Week.toFixed(2)}
                </div>
              </div>

              <div className="text-center" role="listitem">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-3 w-3" aria-hidden="true" />
                  <span id={`${data.symbol}-avg-volume-label`}>Avg Volume</span>
                </div>
                <div 
                  className="font-mono font-semibold"
                  aria-labelledby={`${data.symbol}-avg-volume-label`}
                  aria-label={`Average volume: ${formatVolume(metrics.avgVolume)}`}
                >
                  {formatVolume(metrics.avgVolume)}
                </div>
              </div>

              <div className="text-center" role="listitem">
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-3 w-3" aria-hidden="true" />
                  <span id={`${data.symbol}-prev-close-label`}>Previous Close</span>
                </div>
                <div 
                  className="font-mono font-semibold"
                  aria-labelledby={`${data.symbol}-prev-close-label`}
                  aria-label={`Previous close: ${metrics.previousPrice.toFixed(2)} dollars`}
                >
                  ${metrics.previousPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Fund Information Panel */}
        <FundInfoPanel symbol={data.symbol} />
      </CardContent>
    </Card>
  );
}