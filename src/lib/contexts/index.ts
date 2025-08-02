/**
 * Convenience exports for all context providers and hooks
 * This allows easy importing of all context-related functionality
 */

// Export providers
export { WatchListProvider, useWatchList } from './WatchListContext';
export { ProgressProvider, useProgress } from './ProgressContext';
export { AppProvider } from './AppProvider';

// Export types
export type { WatchListContextType, ProgressContextType } from '../types/contexts';