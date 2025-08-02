/**
 * TypeScript interfaces for React Context types
 * Used for watch-list management and lesson progress tracking
 */

// Watch-list context types
export interface WatchListContextType {
  /** Array of ticker symbols in the watch-list */
  watchList: string[];
  /** Add a ticker symbol to the watch-list */
  addTicker: (symbol: string) => void;
  /** Remove a ticker symbol from the watch-list */
  removeTicker: (symbol: string) => void;
}

// Progress context types
export interface ProgressContextType {
  /** Array of completed lesson slugs */
  completedLessons: string[];
  /** Mark a lesson as complete by its slug */
  markLessonComplete: (slug: string) => void;
}