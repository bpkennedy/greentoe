'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SkipLinks } from "@/components/SkipLinks";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStockData } from "@/lib/hooks/useStockDataAxios";
import { TrendingUp, BookOpen, DollarSign, PieChart } from "lucide-react";

// Temporarily using regular import to debug
import { WatchList } from "@/components/WatchList";

const StockChart = dynamic(() => import("@/components/StockChart").then(mod => ({ default: mod.StockChart })), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

// Temporarily using regular import to debug
import { DataManager } from "@/components/DataManager";

/**
 * Demo component showing StockChart with sample data
 */
function DemoChartSection() {
  const appleData = useStockData('AAPL');
  
  return (
    <Card data-testid="demo-chart-section">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Demo: Interactive Stock Chart
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Live AAPL data showing our chart component in action
        </p>
      </CardHeader>
      <CardContent>
        {appleData.data ? (
          <StockChart data={appleData.data} height={300} />
        ) : appleData.isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chart data...</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-muted-foreground">Chart will appear when data loads</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Feature showcase cards
 */
function FeatureCard({ icon: Icon, title, description, status }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  status: 'complete' | 'in-progress' | 'planned';
}) {
  const statusText = status === 'complete' ? 'Live' : status === 'in-progress' ? 'Building' : 'Planned';
  
  return (
    <Card className="h-full" role="listitem">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-100" role="img" aria-label={`${title} icon`}>
            <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="heading-small">{title}</h3>
              <Badge 
                variant={status === 'complete' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
                className="text-caption text-white"
                role="status"
                aria-label={`Feature status: ${statusText}`}
              >
                {statusText}
              </Badge>
            </div>
            <p className="text-body-small text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SkipLinks />
      
      {/* Header with Logo */}
      <Header currentPage="home" />

      <main 
        className="container-page space-section" 
        id="main-content"
        role="main"
      >
        {/* Hero Section */}
        <section className="text-center space-component" aria-labelledby="hero-title">
          <h2 id="hero-title" className="heading-hero text-foreground">
            Learn Investing Through Interactive Experience
          </h2>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Build your watch-list, analyze stock charts, and learn about investing with real market data. 
            All designed specifically for young investors taking their first steps into financial literacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/lessons" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 rounded-md btn-text transition-colors touch-target focus-visible"
              aria-label="Start learning with 6 financial education lessons"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Start Learning Journey
            </Link>
            <span className="text-caption text-muted-foreground" role="note">
              6 lessons • 85 minutes • Beginner friendly
            </span>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="region" aria-labelledby="interactive-tools-title">
          <h2 id="interactive-tools-title" className="sr-only">Interactive Financial Tools</h2>
          
          {/* Watch List */}
          <section aria-labelledby="watchlist-section">
            <h3 id="watchlist-section" className="sr-only">Stock Watch List</h3>
            <WatchList />
          </section>

          {/* Demo Chart */}
          <section aria-labelledby="chart-section">
            <h3 id="chart-section" className="sr-only">Stock Price Chart</h3>
            <DemoChartSection />
          </section>
        </div>

        {/* Data Management Section */}
        <section className="container-narrow" aria-labelledby="data-management-title">
          <h3 id="data-management-title" className="sr-only">Save and Load Your Progress</h3>
          <DataManager 
            onDataLoaded={(data) => {
              console.log('Data loaded:', data);
              // Could show a toast notification here
            }}
            onDataSaved={(filename) => {
              console.log('Data saved as:', filename);
              // Could show a toast notification here
            }}
          />
        </section>

        <Separator role="separator" aria-hidden="true" />

        {/* Features Section */}
        <section className="space-component" aria-labelledby="features-title">
          <div className="text-center space-content">
            <h2 id="features-title" className="heading-section">Platform Features</h2>
            <p className="text-body text-muted-foreground">Built with modern web technologies and real market data</p>
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            role="list"
            aria-label="Application features"
          >
            <FeatureCard
              icon={TrendingUp}
              title="Real-Time Data"
              description="Live stock prices and charts powered by Alpha Vantage API with smart caching"
              status="complete"
            />
            <FeatureCard
              icon={PieChart}
              title="Interactive Charts"
              description="Professional financial charts with trend analysis and key metrics display"
              status="complete"
            />
            <FeatureCard
              icon={BookOpen}
              title="Educational Lessons"
              description="Step-by-step lessons covering investing fundamentals and market concepts"
              status="complete"
            />
            <FeatureCard
              icon={DollarSign}
              title="Portfolio Tracking"
              description="Track your learning progress and manage your virtual investment portfolio"
              status="in-progress"
            />
          </div>
        </section>

        {/* Technical Stack */}
        <section className="space-content">
          <Card>
            <CardHeader>
              <CardTitle className="heading-card">Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="data-value text-blue-600">Next.js 15</div>
                  <div className="text-caption text-muted-foreground">App Router</div>
                </div>
                <div>
                  <div className="data-value text-green-600">React 19</div>
                  <div className="text-caption text-muted-foreground">Context API</div>
                </div>
                <div>
                  <div className="data-value text-purple-600">TypeScript</div>
                  <div className="text-caption text-muted-foreground">Type Safety</div>
                </div>
                <div>
                  <div className="data-value text-orange-600">Tailwind CSS</div>
                  <div className="text-caption text-muted-foreground">shadcn/ui</div>
                </div>
                <div>
                  <div className="data-value text-cyan-600">Axios</div>
                  <div className="text-caption text-muted-foreground">Data Fetching</div>
                </div>
                <div>
                  <div className="data-value text-red-600">Recharts</div>
                  <div className="text-caption text-muted-foreground">Visualization</div>
                </div>
                <div>
                  <div className="data-value text-indigo-600">FMP API</div>
                  <div className="text-caption text-muted-foreground">Market Data</div>
                </div>
                <div>
                  <div className="data-value text-gray-600">WCAG 2.2</div>
                  <div className="text-caption text-muted-foreground">Accessibility</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Green Thumb - Educational platform for learning about investing and financial literacy.</p>
            <p className="mt-2">Built with Next.js, React, and real market data. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
