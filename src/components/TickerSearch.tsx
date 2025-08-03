'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, TrendingUp, Building2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchStocks, type StockSuggestion } from '@/lib/data/commonStocks';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

/**
 * Individual suggestion item component
 */
interface SuggestionItemProps {
  suggestion: StockSuggestion;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

function SuggestionItem({ suggestion, isSelected, onClick, onMouseEnter }: SuggestionItemProps) {
  const getIcon = () => {
    if (suggestion.type === 'index-fund') return Building2;
    if (suggestion.type === 'etf') return Building2;
    return TrendingUp;
  };
  
  const getIconColor = () => {
    if (suggestion.type === 'index-fund') return suggestion.isEducational ? 'text-primary' : 'text-primary';
    if (suggestion.type === 'etf') return 'text-primary';
    return 'text-blue-600';
  };
  
  const getIconBg = () => {
    if (suggestion.type === 'index-fund') return suggestion.isEducational ? 'bg-primary/15' : 'bg-primary/10';
    if (suggestion.type === 'etf') return 'bg-primary/10';
    return 'bg-blue-100';
  };
  
  const getBadgeVariant = () => {
    if (suggestion.type === 'index-fund') return 'default';
    if (suggestion.type === 'etf') return 'default';
    return 'secondary';
  };
  
  const Icon = getIcon();
  
  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full h-auto justify-start p-3 text-left',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <div className={cn(
        'p-1.5 rounded-full flex-shrink-0 mr-3',
        getIconBg()
      )}>
        <Icon className={cn('h-3 w-3', getIconColor())} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold">
            {suggestion.symbol}
          </span>
          <Badge 
            variant={getBadgeVariant()}
            className="text-xs"
          >
            {suggestion.type === 'index-fund' ? 'INDEX' : suggestion.type.toUpperCase()}
          </Badge>
          {suggestion.isEducational && (
            <Badge 
              variant="educational"
              className="text-xs"
            >
              EDUCATIONAL
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {suggestion.name}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {suggestion.category && (
            <span>{suggestion.category}</span>
          )}
          {suggestion.expenseRatio !== undefined && (
            <>
              {suggestion.category && <span>•</span>}
              <span>{suggestion.expenseRatio}% expense ratio</span>
            </>
          )}
        </div>
        {suggestion.reason && (
          <div className="text-xs text-muted-foreground italic">
            {suggestion.reason}
          </div>
        )}
      </div>
      
      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
    </Button>
  );
}

/**
 * Enhanced ticker search component with autocomplete
 */
interface TickerSearchProps {
  onSelect: (symbol: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function TickerSearch({ 
  onSelect, 
  className, 
  placeholder = "Search stocks & ETFs...",
  disabled = false 
}: TickerSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes - now using live Yahoo Finance search
  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (query.length >= 2) { // Require at least 2 characters for live search
      const searchTimeout = setTimeout(async () => {
        setIsLoading(true); // Set loading only when actually starting the API call
        try {
          console.log(`🔍 TickerSearch: Searching for "${query}"`);
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          
          console.log(`🔍 TickerSearch: Got ${data.results?.length || 0} results`);
          setSuggestions(data.results || []);
          setIsOpen((data.results || []).length > 0);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('TickerSearch: Live search failed, falling back to static search:', error);
          // Fallback to static search
          const results = searchStocks(query, 8);
          setSuggestions(results);
          setIsOpen(results.length > 0);
          setSelectedIndex(-1);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Debounce search requests

      return () => {
        clearTimeout(searchTimeout);
        setIsLoading(false); // Clear loading if timeout is cancelled
      };
    } else if (query.length === 1) {
      // For single character, use static search for instant feedback
      const results = searchStocks(query, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setSelectedIndex(-1);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: StockSuggestion) => {
    setIsLoading(true);
    try {
      onSelect(suggestion.symbol);
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('TickerSearch: onSelect failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual symbol submission
  const handleSubmit = () => {
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;

    // Basic symbol validation
    if (!/^[A-Z0-9.-]+$/.test(symbol)) {
      return;
    }

    setIsLoading(true);
    try {
      onSelect(symbol);
      setQuery('');
      setIsOpen(false);
      setSelectedIndex(-1);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setQuery(value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (query.length >= 1 && suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className="pl-10 pr-10"
          aria-label="Search for stocks and ETFs"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-in fade-in-0 slide-in-from-top-2 duration-200"
          role="listbox"
          aria-label="Stock suggestions"
        >
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.symbol}
                suggestion={suggestion}
                isSelected={index === selectedIndex}
                onClick={() => handleSelectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              />
            ))}
          </div>
          
          {/* Help text */}
          <div className="border-t border-gray-100 px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-600">
              Can&apos;t find a symbol? Type it manually and press Enter
            </p>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <div className="px-3 py-4 text-center">
            <p className="text-sm text-gray-600">
              No suggestions found for &quot;{query}&quot;
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You can still add it manually by pressing Enter
            </p>
          </div>
        </div>
      )}
    </div>
  );
}