'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProgressContextType } from '../types/contexts';

// Create the context with undefined as default value
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// Provider component props
interface ProgressProviderProps {
  children: ReactNode;
}

/**
 * ProgressProvider component that manages the state of completed lessons
 * Provides function to mark lessons as complete by their slug
 */
export function ProgressProvider({ children }: ProgressProviderProps) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Mark a lesson as complete by its slug (avoid duplicates)
  const markLessonComplete = (slug: string) => {
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) return; // Don't add empty slugs
    
    setCompletedLessons(prevLessons => {
      if (prevLessons.includes(trimmedSlug)) {
        return prevLessons; // Lesson already marked complete, don't add duplicate
      }
      return [...prevLessons, trimmedSlug];
    });
  };

  const value: ProgressContextType = {
    completedLessons,
    markLessonComplete,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

/**
 * Custom hook to use the ProgressContext
 * Throws an error if used outside of ProgressProvider
 */
export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  
  return context;
}