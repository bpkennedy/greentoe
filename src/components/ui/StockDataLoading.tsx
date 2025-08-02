/**
 * Loading components for stock data fetching states
 * Provides various loading indicators for different UI contexts
 */

import React from 'react';
import { cn } from '@/lib/utils';

// Basic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Card-style loading skeleton for stock data
interface StockCardSkeletonProps {
  className?: string;
}

export function StockCardSkeleton({ className }: StockCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm',
        className
      )}
      aria-label="Loading stock data"
    >
      {/* Stock symbol and name skeleton */}
      <div className="mb-3 flex items-center justify-between">
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Price skeleton */}
      <div className="mb-2 h-7 w-24 animate-pulse rounded bg-gray-200" />

      {/* Change indicator skeleton */}
      <div className="mb-4 h-4 w-20 animate-pulse rounded bg-gray-200" />

      {/* Chart area skeleton */}
      <div className="h-32 w-full animate-pulse rounded bg-gray-100" />

      {/* Stats skeleton */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

// Inline loading for small spaces (e.g., within watch-list items)
interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text = 'Loading...', className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-500', className)}>
      <LoadingSpinner size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Loading overlay for existing components
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = 'Loading...', 
  className 
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="lg" />
            <span className="text-sm font-medium text-gray-700">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Watch-list specific loading component
interface WatchListLoadingProps {
  itemCount?: number;
  className?: string;
}

export function WatchListLoading({ itemCount = 3, className }: WatchListLoadingProps) {
  return (
    <div className={cn('space-y-3', className)} aria-label="Loading watch list">
      {Array.from({ length: itemCount }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
        >
          {/* Symbol */}
          <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
          
          {/* Price and change */}
          <div className="flex flex-col items-end gap-1">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}