const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const createMDX = require('@next/mdx')

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  
  // Bundle optimization settings
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-progress', 
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      'recharts'
    ],
  },
  
  // Disable source maps in production for smaller bundles
  productionBrowserSourceMaps: false,
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      // Enable tree shaking for specific packages
      config.optimization.sideEffects = false
      
      // Split chunks more aggressively
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Separate vendor chunks
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          // Separate UI library chunks
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-libs',
            chunks: 'all',
            priority: 20,
          },
          // Separate chart library
          charts: {
            test: /[\\/]node_modules[\\/](recharts)[\\/]/,
            name: 'charts',
            chunks: 'all',
            priority: 20,
          },
          // Common chunks
          common: {
            minChunks: 2,
            name: 'common',
            chunks: 'all',
            priority: 5,
          },
        },
      }
    }
    
    return config
  },
}

module.exports = withBundleAnalyzer(withMDX(nextConfig))