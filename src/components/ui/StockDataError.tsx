/**
 * Error components for stock data fetching failures
 * Provides user-friendly error messages and retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StockDataError as StockDataErrorType } from '@/lib/types/alphaVantage';

// Error icon mapping
const ERROR_ICONS = {
  RATE_LIMIT: AlertTriangle,
  INVALID_SYMBOL: Ban,
  API_ERROR: AlertCircle,
  NETWORK_ERROR: WifiOff,
} as const;

// Error styling mapping
const ERROR_STYLES = {
  RATE_LIMIT: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  INVALID_SYMBOL: 'border-red-200 bg-red-50 text-red-800',
  API_ERROR: 'border-red-200 bg-red-50 text-red-800',
  NETWORK_ERROR: 'border-orange-200 bg-orange-50 text-orange-800',
} as const;

// Basic error display component
interface StockErrorDisplayProps {
  error: StockDataErrorType;
  onRetry?: () => void;
  className?: string;
  showRetryButton?: boolean;
}

export function StockErrorDisplay({ 
  error, 
  onRetry, 
  className,
  showRetryButton = true 
}: StockErrorDisplayProps) {
  const Icon = ERROR_ICONS[error.type] || AlertCircle;
  const errorStyles = ERROR_STYLES[error.type] || ERROR_STYLES.API_ERROR;

  return (
    <div
      className={cn(
        'rounded-lg border p-4',
        errorStyles,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium">
            {getErrorTitle(error.type)}
          </h3>
          <p className="mt-1 text-sm opacity-90">
            {error.message}
          </p>
          
          {showRetryButton && error.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline error for small spaces
interface InlineErrorProps {
  error: StockDataErrorType;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className }: InlineErrorProps) {
  const Icon = ERROR_ICONS[error.type] || AlertCircle;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Icon className="h-4 w-4 text-red-500 flex-shrink-0" />
      <span className="text-red-700 truncate">{getShortErrorMessage(error)}</span>
      {error.canRetry && onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 inline-flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
          title="Retry"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="sr-only">Retry</span>
        </button>
      )}
    </div>
  );
}

// Card-style error for stock cards
interface StockCardErrorProps {
  symbol: string;
  error: StockDataErrorType;
  onRetry?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function StockCardError({ 
  symbol, 
  error, 
  onRetry, 
  onRemove, 
  className 
}: StockCardErrorProps) {
  const Icon = ERROR_ICONS[error.type] || AlertCircle;

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">
              {symbol} - {getErrorTitle(error.type)}
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error.message}
            </p>
          </div>
        </div>
        
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
            title="Remove from watch list"
          >
            <Ban className="h-4 w-4" />
            <span className="sr-only">Remove {symbol} from watch list</span>
          </button>
        )}
      </div>
      
      {error.canRetry && onRetry && (
        <div className="mt-3">
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

// Empty state for when there's no data
interface EmptyStockDataProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyStockData({ 
  message = "No stock data available", 
  action,
  className 
}: EmptyStockDataProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">No Data</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {action && (
        <div className="mt-4">
          <button
            onClick={action.onClick}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

// Utility functions
function getErrorTitle(errorType: StockDataErrorType['type']): string {
  switch (errorType) {
    case 'RATE_LIMIT':
      return 'Rate limit exceeded';
    case 'INVALID_SYMBOL':
      return 'Invalid symbol';
    case 'API_ERROR':
      return 'API error';
    case 'NETWORK_ERROR':
      return 'Connection error';
    default:
      return 'Error';
  }
}

function getShortErrorMessage(error: StockDataErrorType): string {
  switch (error.type) {
    case 'RATE_LIMIT':
      return 'Rate limited';
    case 'INVALID_SYMBOL':
      return 'Invalid symbol';
    case 'API_ERROR':
      return 'API error';
    case 'NETWORK_ERROR':
      return 'Connection failed';
    default:
      return 'Error';
  }
}