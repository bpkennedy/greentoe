'use client';

import { WatchList } from "@/components/WatchList";
import { StockChart } from "@/components/StockChart";
import { DataManager } from "@/components/DataManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useStockData } from "@/lib/hooks/useStockDataAxios";
import { TrendingUp, BookOpen, DollarSign, PieChart } from "lucide-react";

/**
 * Demo component showing StockChart with sample data
 */
function DemoChartSection() {
  const appleData = useStockData('AAPL');
  
  return (
    <Card>
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
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-blue-100">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{title}</h3>
              <Badge 
                variant={status === 'complete' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}
                className="text-xs"
              >
                {status === 'complete' ? 'Live' : status === 'in-progress' ? 'Building' : 'Planned'}
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
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Green Thumb</h1>
              <p className="text-muted-foreground mt-1">Financial Education for Teenagers</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Alpha Version
              </Badge>
              <Badge variant="default" className="text-xs">
                Live Demo
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Learn Investing Through Interactive Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build your watch-list, analyze stock charts, and learn about investing with real market data. 
            All designed specifically for teenagers taking their first steps into financial literacy.
          </p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Watch List */}
          <div className="space-y-4">
            <WatchList />
          </div>

          {/* Demo Chart */}
          <div className="space-y-4">
            <DemoChartSection />
          </div>
        </div>

        {/* Data Management Section */}
        <section className="max-w-2xl mx-auto">
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

        <Separator />

        {/* Features Section */}
        <section className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Platform Features</h3>
            <p className="text-muted-foreground">Built with modern web technologies and real market data</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              status="planned"
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
