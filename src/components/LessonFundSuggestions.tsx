'use client';

import React from 'react';
import { TrendingUp, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getFundsByEducationalTag, getBeginnerFriendlyFunds, getFundBySymbol } from '@/lib/staticData';

/**
 * Props for individual fund suggestion card
 */
interface FundSuggestionCardProps {
  symbol: string;
  name: string;
  provider: string;
  category: string;
  expenseRatio: number;
  keyFacts: string[];
  reason?: string;
  onAddToWatchList?: (symbol: string) => void;
}

function FundSuggestionCard({
  symbol,
  name,
  provider,
  category,
  expenseRatio,
  keyFacts,
  reason,
  onAddToWatchList
}: FundSuggestionCardProps) {
  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-emerald-100">
              <Building2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{symbol}</CardTitle>
              <p className="text-sm text-muted-foreground">{provider}</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {expenseRatio}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-1">{name}</h4>
          <p className="text-sm text-emerald-700 font-medium">{category}</p>
        </div>
        
        {reason && (
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800 italic">💡 {reason}</p>
          </div>
        )}
        
        <div>
          <h5 className="text-sm font-medium text-muted-foreground mb-2">Key Benefits:</h5>
          <ul className="space-y-1">
            {keyFacts.slice(0, 2).map((fact, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-emerald-500 mt-1 text-xs">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {onAddToWatchList && (
          <Button 
            onClick={() => onAddToWatchList(symbol)}
            variant="outline" 
            size="sm" 
            className="w-full text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          >
            <TrendingUp className="h-3 w-3 mr-2" />
            Add to Watch List
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Props for the main lesson fund suggestions component
 */
interface LessonFundSuggestionsProps {
  /** Educational tag to filter funds by */
  educationalTag?: string;
  /** Specific fund symbols to display */
  symbols?: string[];
  /** Custom title for the suggestions section */
  title?: string;
  /** Custom description */
  description?: string;
  /** Maximum number of suggestions to show */
  limit?: number;
  /** Custom CSS class */
  className?: string;
  /** Callback when user wants to add fund to watch list */
  onAddToWatchList?: (symbol: string) => void;
}

/**
 * Component for displaying fund suggestions within lessons
 */
export function LessonFundSuggestions({
  educationalTag,
  symbols,
  title = "📚 Related Index Funds to Explore",
  description = "Based on this lesson, here are some beginner-friendly index funds worth considering:",
  limit = 3,
  className,
  onAddToWatchList
}: LessonFundSuggestionsProps) {
  const funds = React.useMemo(() => {
    try {
      if (symbols) {
        // Get specific funds by symbols
        return symbols
          .map(symbol => getFundBySymbol(symbol))
          .filter(fund => fund !== undefined)
          .slice(0, limit);
      } else if (educationalTag) {
        // Get funds by educational tag
        return getFundsByEducationalTag(educationalTag).slice(0, limit);
      } else {
        // Default to beginner-friendly funds
        return getBeginnerFriendlyFunds().slice(0, limit);
      }
    } catch (error) {
      console.warn('Error loading fund suggestions:', error);
      return [];
    }
  }, [symbols, educationalTag, limit]);

  if (funds.length === 0) {
    return null;
  }

  return (
    <div className={cn('my-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200', className)}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-emerald-800 mb-2">{title}</h3>
        <p className="text-emerald-700 text-sm max-w-2xl mx-auto">{description}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {funds.map((fund) => (
          <FundSuggestionCard
            key={fund.symbol}
            symbol={fund.symbol}
            name={fund.name}
            provider={fund.provider}
            category={fund.category}
            expenseRatio={fund.expenseRatio}
            keyFacts={fund.keyFacts}
            reason={getReasonForLesson(fund, educationalTag)}
            onAddToWatchList={onAddToWatchList}
          />
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-emerald-600">
          💡 These suggestions are for educational purposes. Always do your own research before investing.
        </p>
      </div>
    </div>
  );
}

/**
 * Generate contextual reason based on educational tag or fund characteristics
 */
function getReasonForLesson(fund: { symbol: string; expenseRatio: number }, educationalTag?: string): string {
  if (educationalTag === 'beginner-friendly') {
    return "Perfect starting point for new investors with low costs and broad diversification";
  }
  
  if (educationalTag === 'low-cost') {
    return `Ultra-low ${fund.expenseRatio}% expense ratio keeps more money in your pocket`;
  }
  
  if (educationalTag === 'diversification') {
    return "Provides instant diversification across hundreds of companies";
  }
  
  if (fund.symbol === 'VTI') {
    return "Owns the entire U.S. stock market - the ultimate diversification";
  }
  
  if (fund.symbol === 'VOO' || fund.symbol === 'SPY') {
    return "Tracks the S&P 500 - the most popular index for long-term investing";
  }
  
  if (fund.symbol === 'VXUS') {
    return "Perfect complement for international diversification";
  }
  
  if (fund.symbol === 'FNILX') {
    return "Zero expense ratio means all your money stays invested";
  }
  
  if (fund.expenseRatio === 0) {
    return "Zero fees means maximum compound growth over time";
  }
  
  if (fund.expenseRatio <= 0.03) {
    return "Ultra-low cost option that's perfect for long-term investing";
  }
  
  return "Excellent choice for building long-term wealth through index investing";
}

/**
 * Specific fund suggestions for index fund lessons
 */
export function IndexFundBasicsSuggestions({ onAddToWatchList }: { onAddToWatchList?: (symbol: string) => void }) {
  return (
    <LessonFundSuggestions
      symbols={['VTI', 'VOO', 'FNILX']}
      title="🎯 Top Index Funds for Beginners"
      description="These three funds represent the most popular and beginner-friendly options for getting started with index investing:"
      onAddToWatchList={onAddToWatchList}
    />
  );
}

/**
 * Fund suggestions for comparing investments lesson
 */
export function InvestmentComparisonSuggestions({ onAddToWatchList }: { onAddToWatchList?: (symbol: string) => void }) {
  return (
    <LessonFundSuggestions
      symbols={['FNILX', 'FXAIX', 'VBTLX']}
      title="📊 Compare These Investment Options"
      description="Practice comparing these funds using the metrics from this lesson - notice the different expense ratios and asset classes:"
      onAddToWatchList={onAddToWatchList}
    />
  );
}

/**
 * Fund suggestions for risk/diversification lessons
 */
export function DiversificationSuggestions({ onAddToWatchList }: { onAddToWatchList?: (symbol: string) => void }) {
  return (
    <LessonFundSuggestions
      symbols={['VTI', 'VXUS', 'VBTLX']}
      title="🌍 Build a Diversified Portfolio"
      description="These three funds show how to diversify across U.S. stocks, international stocks, and bonds:"
      onAddToWatchList={onAddToWatchList}
    />
  );
}