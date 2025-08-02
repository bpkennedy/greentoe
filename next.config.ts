import type { NextConfig } from "next";
import createMDX from '@next/mdx';

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
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
};

export default withMDX(nextConfig);