/**
 * TypeScript interfaces for index fund static data
 */

export interface IndexFund {
  symbol: string;
  name: string;
  provider: string;
  category: string;
  type: 'ETF' | 'Mutual Fund';
  description: string;
  expenseRatio: number;
  keyFacts: string[];
  indexTracked: string;
  marketCap: 'Small Cap' | 'Large Cap' | 'All Cap' | 'N/A';
  region: 'US' | 'International';
  assetClass: 'Equity' | 'Fixed Income';
  inceptionYear: number;
  minimumInvestment: number;
  isEducational: boolean;
  educationalTags: string[];
}

export interface FundCategory {
  id: string;
  name: string;
  description: string;
  fundSymbols: string[];
}

export interface FundProvider {
  id: string;
  name: string;
  description: string;
  fundSymbols: string[];
}

export interface EducationalTag {
  id: string;
  name: string;
  description: string;
  fundSymbols: string[];
}

export interface IndexFundMetadata {
  lastUpdated: string;
  dataSource: string;
  totalFunds: number;
  averageExpenseRatio: number;
  version: string;
}

export interface IndexFundData {
  funds: IndexFund[];
  categories: FundCategory[];
  providers: FundProvider[];
  educationalTags: EducationalTag[];
  metadata: IndexFundMetadata;
}

// Search and filter types
export interface FundSearchOptions {
  query?: string;
  category?: string;
  provider?: string;
  assetClass?: 'Equity' | 'Fixed Income';
  maxExpenseRatio?: number;
  minInceptionYear?: number;
  educationalTagsOnly?: boolean;
}

export interface FundSearchResult {
  fund: IndexFund;
  score: number;
  matchedFields: string[];
}

// Integration types for watch list and charts
export interface WatchListFundSuggestion {
  symbol: string;
  name: string;
  category: string;
  expenseRatio: number;
  reason: string;
  isEducational: boolean;
}

export interface ChartFundInfo {
  symbol: string;
  name: string;
  expenseRatio: number;
  provider: string;
  category: string;
  keyFacts: string[];
}