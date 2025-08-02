/**
 * Wrapper component that handles loading and error states for stock data
 * Provides a unified interface for managing SWR hook states
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { UseStockDataReturn } from '@/lib/types/alphaVantage';
import { StockCardSkeleton, InlineLoading, LoadingOverlay } from './StockDataLoading';
import { StockErrorDisplay, InlineError, StockCardError } from './StockDataError';

// Main wrapper component for stock data states
interface StockDataWrapperProps {
  hookResult: UseStockDataReturn;
  symbol?: string;
  variant?: 'card' | 'inline' | 'overlay';
  onRetry?: () => void;
  onRemove?: () => void;
  children: (data: NonNullable<UseStockDataReturn['data']>) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  className?: string;
}

export function StockDataWrapper({
  hookResult,
  symbol,
  variant = 'card',
  onRetry,
  onRemove,
  children,
  loadingComponent,
  errorComponent,
  className,
}: StockDataWrapperProps) {
  const { data, error, isLoading, mutate } = hookResult;

  // Use provided retry function or default to mutate
  const handleRetry = onRetry || (() => mutate());

  // Loading state
  if (isLoading && !data) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    switch (variant) {
      case 'card':
        return <StockCardSkeleton className={className} />;
      case 'inline':
        return <InlineLoading text={`Loading ${symbol || 'stock data'}...`} className={className} />;
      case 'overlay':
        return (
          <div className={cn('min-h-32 flex items-center justify-center', className)}>
            <InlineLoading text={`Loading ${symbol || 'stock data'}...`} />
          </div>
        );
      default:
        return <StockCardSkeleton className={className} />;
    }
  }

  // Error state
  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    switch (variant) {
      case 'card':
        return (
          <StockCardError
            symbol={symbol || 'Unknown'}
            error={error}
            onRetry={handleRetry}
            onRemove={onRemove}
            className={className}
          />
        );
      case 'inline':
        return (
          <InlineError
            error={error}
            onRetry={handleRetry}
            className={className}
          />
        );
      case 'overlay':
        return (
          <div className={cn('min-h-32 flex items-center justify-center', className)}>
            <StockErrorDisplay
              error={error}
              onRetry={handleRetry}
              showRetryButton={true}
            />
          </div>
        );
      default:
        return (
          <StockErrorDisplay
            error={error}
            onRetry={handleRetry}
            className={className}
          />
        );
    }
  }

  // Success state with data
  if (data) {
    const content = children(data);
    
    if (variant === 'overlay') {
      return (
        <LoadingOverlay 
          isLoading={hookResult.isValidating} 
          loadingText="Updating..."
          className={className}
        >
          {content}
        </LoadingOverlay>
      );
    }
    
    return <div className={className}>{content}</div>;
  }

  // No data and no error (shouldn't happen with proper SWR setup)
  return (
    <div className={cn('text-center py-4 text-gray-500', className)}>
      No data available
    </div>
  );
}

// Simplified wrapper for watch-list items
interface WatchListItemWrapperProps {
  symbol: string;
  hookResult: UseStockDataReturn;
  onRemove?: () => void;
  children: (data: NonNullable<UseStockDataReturn['data']>) => React.ReactNode;
  className?: string;
}

export function WatchListItemWrapper({
  symbol,
  hookResult,
  onRemove,
  children,
  className,
}: WatchListItemWrapperProps) {
  return (
    <StockDataWrapper
      hookResult={hookResult}
      symbol={symbol}
      variant="inline"
      onRemove={onRemove}
      className={className}
    >
      {children}
    </StockDataWrapper>
  );
}

// Chart wrapper with overlay loading
interface StockChartWrapperProps {
  symbol: string;
  hookResult: UseStockDataReturn;
  children: (data: NonNullable<UseStockDataReturn['data']>) => React.ReactNode;
  className?: string;
}

export function StockChartWrapper({
  symbol,
  hookResult,
  children,
  className,
}: StockChartWrapperProps) {
  return (
    <StockDataWrapper
      hookResult={hookResult}
      symbol={symbol}
      variant="overlay"
      className={className}
    >
      {children}
    </StockDataWrapper>
  );
}

// Hook for managing multiple stock data states
interface MultiStockWrapperProps {
  hookResults: Record<string, UseStockDataReturn>;
  children: (
    results: Array<{
      symbol: string;
      data: NonNullable<UseStockDataReturn['data']>;
      hookResult: UseStockDataReturn;
    }>
  ) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}

export function MultiStockWrapper({
  hookResults,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className,
}: MultiStockWrapperProps) {
  const symbols = Object.keys(hookResults);
  
  // Check if any are loading
  const hasLoading = symbols.some(symbol => hookResults[symbol].isLoading);
  
  // Get successful results
  const successfulResults = symbols
    .map(symbol => ({
      symbol,
      hookResult: hookResults[symbol],
      data: hookResults[symbol].data,
    }))
    .filter((result): result is { symbol: string; hookResult: UseStockDataReturn; data: NonNullable<UseStockDataReturn['data']> } => 
      result.data !== undefined
    );
  
  // Get errors
  const errors = symbols
    .map(symbol => ({ symbol, error: hookResults[symbol].error }))
    .filter(result => result.error !== undefined);

  // Show loading if all are loading and no data yet
  if (hasLoading && successfulResults.length === 0) {
    return loadingComponent || <InlineLoading text="Loading stocks..." className={className} />;
  }

  // Show error if all failed and no successful results
  if (errors.length > 0 && successfulResults.length === 0) {
    const firstError = errors[0];
    return errorComponent || (
      <StockErrorDisplay
        error={firstError.error!}
        className={className}
      />
    );
  }

  // Show empty state if no results
  if (successfulResults.length === 0) {
    return emptyComponent || (
      <div className={cn('text-center py-4 text-gray-500', className)}>
        No stock data available
      </div>
    );
  }

  // Render successful results
  return (
    <div className={className}>
      {children(successfulResults)}
    </div>
  );
}