'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WatchListContextType } from '../types/contexts';

// Create the context with undefined as default value
const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

// Provider component props
interface WatchListProviderProps {
  children: ReactNode;
}

/**
 * WatchListProvider component that manages the state of ticker symbols in the watch-list
 * Provides functions to add and remove ticker symbols from the watch-list
 */
export function WatchListProvider({ children }: WatchListProviderProps) {
  const [watchList, setWatchList] = useState<string[]>([]);

  // Add a ticker symbol to the watch-list (avoid duplicates)
  const addTicker = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    if (!upperSymbol) return; // Don't add empty symbols
    
    setWatchList(prevList => {
      if (prevList.includes(upperSymbol)) {
        return prevList; // Symbol already exists, don't add duplicate
      }
      return [...prevList, upperSymbol];
    });
  };

  // Remove a ticker symbol from the watch-list
  const removeTicker = (symbol: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    setWatchList(prevList => prevList.filter(ticker => ticker !== upperSymbol));
  };

  const value: WatchListContextType = {
    watchList,
    addTicker,
    removeTicker,
  };

  return (
    <WatchListContext.Provider value={value}>
      {children}
    </WatchListContext.Provider>
  );
}

/**
 * Custom hook to use the WatchListContext
 * Throws an error if used outside of WatchListProvider
 */
export function useWatchList(): WatchListContextType {
  const context = useContext(WatchListContext);
  
  if (context === undefined) {
    throw new Error('useWatchList must be used within a WatchListProvider');
  }
  
  return context;
}