import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Fix workspace root warning
  outputFileTracingRoot: __dirname,

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization with modern formats
  images: {
    formats: ['image/webp'], // Remove AVIF to prevent hydration issues
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for aggressive optimization
    dangerouslyAllowSVG: true, // Allow SVG for placeholder
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental optimizations
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['lucide-react', '@prisma/client'],
  },

  // Bundle optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },

  // Optimize power usage
  poweredByHeader: false,
}

export default nextConfig
