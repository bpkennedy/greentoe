'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { SkipLinks } from "@/components/SkipLinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStockData } from "@/lib/hooks/useStockDataAxios";
import { TrendingUp, BookOpen, DollarSign, PieChart } from "lucide-react";

// Lazy load heavy components to reduce initial bundle size
const WatchList = dynamic(() => import("@/components/WatchList").then(mod => ({ default: mod.WatchList })), {
  ssr: false,
  loading: () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Watch List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </CardContent>
    </Card>
  ),
});

const StockChart = dynamic(() => import("@/components/StockChart").then(mod => ({ default: mod.StockChart })), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-muted/20 rounded">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

const DataManager = dynamic(() => import("@/components/DataManager").then(mod => ({ default: mod.DataManager })), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </CardContent>
    </Card>
  ),
});

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
              <h3 className="font-semibold">{title}</h3>
              <Badge 
                variant={status === 'complete' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
                className="text-xs"
                role="status"
                aria-label={`Feature status: ${statusText}`}
              >
                {statusText}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
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
      
      {/* Header */}
      <header 
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        role="banner"
        id="navigation"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Green Thumb</h1>
              <p className="text-muted-foreground mt-1">Financial Education for Teenagers</p>
            </div>
            <nav role="navigation" aria-label="Site navigation">
              <div className="flex items-center gap-3">
                <Link 
                  href="/parent" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors touch-target focus-visible"
                  aria-label="Access parent dashboard to monitor teen's progress"
                >
                  Parent Dashboard
                </Link>
                <div className="flex items-center gap-2" role="group" aria-label="Version information">
                  <Badge variant="outline" className="text-xs">
                    Alpha Version
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    Live Demo
                  </Badge>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main 
        className="container mx-auto px-4 py-8 space-y-8" 
        id="main-content"
        role="main"
      >
        {/* Hero Section */}
        <section className="text-center space-y-6" aria-labelledby="hero-title">
          <h2 id="hero-title" className="text-2xl font-bold text-foreground">
            Learn Investing Through Interactive Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build your watch-list, analyze stock charts, and learn about investing with real market data. 
            All designed specifically for teenagers taking their first steps into financial literacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/lessons" 
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2 rounded-md text-sm font-medium transition-colors touch-target focus-visible"
              aria-label="Start learning with 6 financial education lessons"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Start Learning Journey
            </Link>
            <span className="text-sm text-muted-foreground" role="note">
              6 lessons • 85 minutes • Beginner friendly
            </span>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" role="region" aria-labelledby="interactive-tools-title">
          <h2 id="interactive-tools-title" className="sr-only">Interactive Financial Tools</h2>
          
          {/* Watch List */}
          <section className="space-y-4" aria-labelledby="watchlist-section">
            <h3 id="watchlist-section" className="sr-only">Stock Watch List</h3>
            <WatchList />
          </section>

          {/* Demo Chart */}
          <section className="space-y-4" aria-labelledby="chart-section">
            <h3 id="chart-section" className="sr-only">Stock Price Chart</h3>
            <DemoChartSection />
          </section>
        </div>

        {/* Data Management Section */}
        <section className="max-w-2xl mx-auto" aria-labelledby="data-management-title">
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
        <section className="space-y-6" aria-labelledby="features-title">
          <div className="text-center">
            <h2 id="features-title" className="text-xl font-semibold mb-2">Platform Features</h2>
            <p className="text-muted-foreground">Built with modern web technologies and real market data</p>
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
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="font-semibold text-blue-600">Next.js 15</div>
                  <div className="text-xs text-muted-foreground">App Router</div>
                </div>
                <div>
                  <div className="font-semibold text-green-600">React 19</div>
                  <div className="text-xs text-muted-foreground">Context API</div>
                </div>
                <div>
                  <div className="font-semibold text-purple-600">TypeScript</div>
                  <div className="text-xs text-muted-foreground">Type Safety</div>
                </div>
                <div>
                  <div className="font-semibold text-orange-600">Tailwind CSS</div>
                  <div className="text-xs text-muted-foreground">shadcn/ui</div>
                </div>
                <div>
                  <div className="font-semibold text-cyan-600">SWR</div>
                  <div className="text-xs text-muted-foreground">Data Fetching</div>
                </div>
                <div>
                  <div className="font-semibold text-red-600">Recharts</div>
                  <div className="text-xs text-muted-foreground">Visualization</div>
                </div>
                <div>
                  <div className="font-semibold text-indigo-600">Alpha Vantage</div>
                  <div className="text-xs text-muted-foreground">Market Data</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-600">WCAG 2.2</div>
                  <div className="text-xs text-muted-foreground">Accessibility</div>
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
