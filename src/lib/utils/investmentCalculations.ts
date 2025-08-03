/**
 * Investment calculation utilities
 * Functions for calculating performance metrics and formatting displays
 */

import { InvestmentEntry, PerformanceMetrics, InvestmentCalculations } from '../types/investment';

/**
 * Calculate performance metrics for an investment entry
 */
export function calculatePerformance(
  entry: InvestmentEntry,
  currentPrice: number
): PerformanceMetrics {
  const gainLoss = currentPrice - entry.purchasePrice;
  const gainLossPercentage = (gainLoss / entry.purchasePrice) * 100;
  
  const dateAdded = new Date(entry.dateAdded);
  const now = new Date();
  const daysSinceAdded = Math.floor(
    (now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    currentPrice,
    gainLoss,
    gainLossPercentage,
    daysSinceAdded,
    lastUpdated: now.toISOString()
  };
}

/**
 * Format currency values for display
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  
  // For values >= 0, don't show the + sign for the base value
  if (value === 0) {
    return '$0.00';
  }
  
  const formatted = absValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return value >= 0 ? formatted : `-${formatted.substring(1)}`;
}

/**
 * Format currency values for gains/losses (always show sign)
 */
export function formatGainLoss(value: number): string {
  if (value === 0) {
    return '$0.00';
  }
  
  const absValue = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  
  const formatted = absValue.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${sign}${formatted.substring(1)}`;
}

/**
 * Format percentage values for display
 */
export function formatPercentage(value: number): string {
  if (value === 0) {
    return '0.00%';
  }
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get performance trend indicator
 */
export function getPerformanceTrend(gainLossPercentage: number): 'up' | 'down' | 'neutral' {
  if (gainLossPercentage > 0.01) return 'up';      // > 0.01%
  if (gainLossPercentage < -0.01) return 'down';   // < -0.01%
  return 'neutral';
}

/**
 * Convert legacy watchlist format to investment entries
 */
export function migrateLegacyWatchList(
  legacyWatchList: string[],
  defaultDate?: string
): InvestmentEntry[] {
  const migrationDate = defaultDate || new Date().toISOString();
  
  return legacyWatchList.map(symbol => ({
    symbol: symbol.toUpperCase().trim(),
    dateAdded: migrationDate,
    purchasePrice: 0, // Will need to be updated with actual price data
    reasoning: 'Migrated from legacy watchlist',
    metadata: {
      tags: ['legacy'],
      notes: 'This entry was automatically migrated from an older save file format.'
    }
  }));
}

/**
 * Check if watchlist data needs migration
 */
export function needsMigration(data: unknown): boolean {
  // If data is an array of strings, it's the old format
  return Array.isArray(data) && data.every(item => typeof item === 'string');
}

/**
 * Validate investment entry data
 */
export function validateInvestmentEntry(entry: Partial<InvestmentEntry>): entry is InvestmentEntry {
  return (
    typeof entry.symbol === 'string' &&
    entry.symbol.length > 0 &&
    typeof entry.dateAdded === 'string' &&
    typeof entry.purchasePrice === 'number' &&
    entry.purchasePrice >= 0 &&
    typeof entry.reasoning === 'string'
  );
}

/**
 * Create default investment entry
 */
export function createDefaultInvestmentEntry(
  symbol: string,
  purchasePrice: number = 0,
  reasoning: string = ''
): InvestmentEntry {
  return {
    symbol: symbol.toUpperCase().trim(),
    dateAdded: new Date().toISOString(),
    purchasePrice,
    reasoning: reasoning || `Added ${symbol} to watchlist`,
    metadata: {
      tags: [],
      notes: ''
    }
  };
}

/**
 * Export the calculation utilities object
 */
export const investmentCalculations: InvestmentCalculations = {
  calculatePerformance,
  formatCurrency: formatGainLoss, // Use the signed version for the interface
  formatPercentage
};