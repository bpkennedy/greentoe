import dynamic from 'next/dynamic';

// Lazy load the StockChart component to reduce initial bundle size
// This defers loading of Recharts until the chart is actually needed
const StockChart = dynamic(
  () => import('./StockChart').then((mod) => ({ default: mod.StockChart })),
  {
    ssr: false, // Charts don't need SSR and rely on browser APIs
    loading: () => (
      <div className="w-full h-64 flex items-center justify-center bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    ),
  }
);

export { StockChart };
export default StockChart;