'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { WatchListContextType } from '../types/contexts';
import { InvestmentEntry, InvestmentWithPerformance } from '../types/investment';
import { createDefaultInvestmentEntry } from '../utils/investmentCalculations';

// Create the context with undefined as default value
const WatchListContext = createContext<WatchListContextType | undefined>(undefined);

// Provider component props
interface WatchListProviderProps {
  children: ReactNode;
}

/**
 * WatchListProvider component that manages investment tracking in the watch-list
 * Provides functions to add, remove, and update investments with performance tracking
 */
export function WatchListProvider({ children }: WatchListProviderProps) {
  const [investments, setInvestments] = useState<InvestmentEntry[]>([]);
  const [performanceCache, setPerformanceCache] = useState<Map<string, InvestmentWithPerformance>>(new Map());

  // Add an investment to the watch-list
  const addInvestment = useCallback((investment: Omit<InvestmentEntry, 'dateAdded'>) => {
    const upperSymbol = investment.symbol.toUpperCase().trim();
    if (!upperSymbol) return; // Don't add empty symbols
    
    setInvestments(prevList => {
      // Check if symbol already exists
      if (prevList.some(inv => inv.symbol === upperSymbol)) {
        return prevList; // Symbol already exists, don't add duplicate
      }
      
      const newInvestment: InvestmentEntry = {
        ...investment,
        symbol: upperSymbol,
        dateAdded: new Date().toISOString()
      };
      
      return [...prevList, newInvestment];
    });
  }, []);

  // Add a ticker symbol (legacy support)
  const addTicker = useCallback((symbol: string) => {
    addInvestment(createDefaultInvestmentEntry(symbol, 0, `Added ${symbol} to watchlist`));
  }, [addInvestment]);

  // Remove an investment from the watch-list
  const removeInvestment = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    setInvestments(prevList => prevList.filter(inv => inv.symbol !== upperSymbol));
    
    // Also remove from performance cache
    setPerformanceCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(upperSymbol);
      return newCache;
    });
  }, []);

  // Legacy support for removeTicker
  const removeTicker = useCallback((symbol: string) => {
    removeInvestment(symbol);
  }, [removeInvestment]);

  // Update investment reasoning
  const updateInvestmentReasoning = useCallback((symbol: string, reasoning: string) => {
    const upperSymbol = symbol.toUpperCase().trim();
    setInvestments(prevList => 
      prevList.map(inv => 
        inv.symbol === upperSymbol 
          ? { ...inv, reasoning }
          : inv
      )
    );
  }, []);

  // Refresh performance data (placeholder - will be implemented in UI components)
  const refreshPerformanceData = useCallback(async () => {
    // This will be implemented when we integrate with stock price data
    // For now, we'll just clear the cache to force recalculation
    setPerformanceCache(new Map());
  }, []);

  // Get legacy format for backward compatibility
  const getLegacyWatchList = useCallback((): string[] => {
    return investments.map(inv => inv.symbol);
  }, [investments]);

  // Memoized investments with performance data
  const investmentsWithPerformance = useMemo((): InvestmentWithPerformance[] => {
    return investments.map(investment => {
      const cached = performanceCache.get(investment.symbol);
      if (cached) {
        return cached;
      }

      // For now, return without performance data - will be populated by UI components
      return {
        ...investment,
        performance: undefined
      };
    });
  }, [investments, performanceCache]);

  const value: WatchListContextType = {
    watchList: investments,
    investmentsWithPerformance,
    addInvestment,
    addTicker,
    removeInvestment,
    removeTicker,
    updateInvestmentReasoning,
    refreshPerformanceData,
    getLegacyWatchList,
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