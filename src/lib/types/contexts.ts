/**
 * TypeScript interfaces for React Context types
 * Used for watch-list management and lesson progress tracking
 */

import { InvestmentEntry, InvestmentWithPerformance } from './investment';

// Watch-list context types
export interface WatchListContextType {
  /** Array of investment entries in the watch-list */
  watchList: InvestmentEntry[];
  /** Array of investments with performance data */
  investmentsWithPerformance: InvestmentWithPerformance[];
  /** Add an investment to the watch-list */
  addInvestment: (investment: Omit<InvestmentEntry, 'dateAdded'>) => void;
  /** Add a ticker symbol to the watch-list (legacy support) */
  addTicker: (symbol: string) => void;
  /** Remove an investment from the watch-list */
  removeInvestment: (symbol: string) => void;
  /** Remove a ticker symbol from the watch-list (legacy support) */
  removeTicker: (symbol: string) => void;
  /** Update the reasoning for an existing investment */
  updateInvestmentReasoning: (symbol: string, reasoning: string) => void;
  /** Refresh performance data for all investments */
  refreshPerformanceData: () => Promise<void>;
  /** Get legacy format for backward compatibility */
  getLegacyWatchList: () => string[];
}

// Progress context types
export interface ProgressContextType {
  /** Array of completed lesson slugs */
  completedLessons: string[];
  /** Mark a lesson as complete by its slug */
  markLessonComplete: (slug: string) => void;
}