'use client';

import React, { ReactNode } from 'react';
import { WatchListProvider } from './WatchListContext';
import { ProgressProvider } from './ProgressContext';

// AppProvider component props
interface AppProviderProps {
  children: ReactNode;
}

/**
 * AppProvider component that combines both WatchListProvider and ProgressProvider
 * This provides a single wrapper to give components access to both contexts
 * 
 * Usage:
 * ```jsx
 * <AppProvider>
 *   <YourApp />
 * </AppProvider>
 * ```
 * 
 * Then in any child component, you can use:
 * ```jsx
 * import { useWatchList } from '@/lib/contexts/WatchListContext';
 * import { useProgress } from '@/lib/contexts/ProgressContext';
 * 
 * function MyComponent() {
 *   const { watchList, addTicker, removeTicker } = useWatchList();
 *   const { completedLessons, markLessonComplete } = useProgress();
 *   // ... component logic
 * }
 * ```
 */
export function AppProvider({ children }: AppProviderProps) {
  return (
    <WatchListProvider>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </WatchListProvider>
  );
}