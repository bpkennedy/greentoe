/**
 * TypeScript interfaces for investment tracking functionality
 * Used for enhanced watch-list with performance monitoring
 */

/**
 * Investment entry representing a user's stock/fund selection with tracking data
 */
export interface InvestmentEntry {
  /** Stock/fund ticker symbol (e.g., "AAPL", "VOO") */
  symbol: string;
  
  /** Date when the investment was added to watch-list (ISO string) */
  dateAdded: string;
  
  /** Price at the time the investment was added */
  purchasePrice: number;
  
  /** User's reasoning/logic for selecting this investment */
  reasoning: string;
  
  /** Optional metadata for additional tracking */
  metadata?: {
    /** User-defined tags or categories */
    tags?: string[];
    /** Any additional notes */
    notes?: string;
  };
}

/**
 * Calculated performance metrics for an investment
 */
export interface PerformanceMetrics {
  /** Current price of the investment */
  currentPrice: number;
  
  /** Absolute gain/loss in dollars */
  gainLoss: number;
  
  /** Percentage gain/loss */
  gainLossPercentage: number;
  
  /** Days since the investment was added */
  daysSinceAdded: number;
  
  /** Last updated timestamp (ISO string) */
  lastUpdated: string;
}

/**
 * Complete investment data including performance calculations
 */
export interface InvestmentWithPerformance extends InvestmentEntry {
  /** Real-time performance metrics */
  performance?: PerformanceMetrics;
}

/**
 * Utility functions for investment calculations
 */
export interface InvestmentCalculations {
  /**
   * Calculate performance metrics for an investment
   * @param entry Investment entry data
   * @param currentPrice Current market price
   * @returns Calculated performance metrics
   */
  calculatePerformance: (entry: InvestmentEntry, currentPrice: number) => PerformanceMetrics;
  
  /**
   * Format currency values for display
   * @param value Dollar amount
   * @returns Formatted string (e.g., "$123.45", "-$45.67")
   */
  formatCurrency: (value: number) => string;
  
  /**
   * Format percentage values for display
   * @param value Percentage as decimal (e.g., 0.1234 for 12.34%)
   * @returns Formatted string (e.g., "+12.34%", "-5.67%")
   */
  formatPercentage: (value: number) => string;
}

/**
 * Migration utility for converting legacy watchlist format
 */
export interface WatchListMigration {
  /**
   * Convert old string array format to new investment entries
   * @param legacyWatchList Array of ticker symbols
   * @param defaultDate Date to use for legacy entries
   * @returns Array of investment entries
   */
  migrateLegacyWatchList: (legacyWatchList: string[], defaultDate?: string) => InvestmentEntry[];
  
  /**
   * Check if watchlist data needs migration
   * @param data Raw watchlist data
   * @returns True if migration is needed
   */
  needsMigration: (data: unknown) => boolean;
}