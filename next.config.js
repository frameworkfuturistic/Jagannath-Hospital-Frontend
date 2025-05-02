/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // =====================
  // Core Configuration
  // =====================
  reactStrictMode: false,
  output: 'standalone',
  trailingSlash: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,

  // =====================
  // Console Management
  // =====================
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error'],
          }
        : false,
  },

  // =====================
  // Image Optimization
  // =====================
  images: {
    remotePatterns: [
      // Primary domains
      {
        protocol: 'https',
        hostname: 'sjhrc.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.sjhrc.in',
        pathname: '/**',
      },

      // Cloud/CDN providers
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },

      // Stock image providers
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        pathname: '/**',
      },

      // Partner domains
      {
        protocol: 'https',
        hostname: 'cdn.eyemyeye.com',
        pathname: '/**',
      },

      // Media outlets
      {
        protocol: 'https',
        hostname: 'gratisography.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'azbigmedia.com',
        pathname: '/wp-content/uploads/**',
      },

      // Development only
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '3000',
              pathname: '/**',
            },
          ]
        : []),
    ],

    // Optimization settings
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
  },

  // =====================
  // Production Optimizations
  // =====================
  compress: true,
  swcMinify: true,

  // =====================
  // Security Headers
  // =====================
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],

  // =====================
  // Environment Configuration
  // =====================
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'production',
    NEXT_PUBLIC_SITE_URL: 'https://sjhrc.in',
  },

  // =====================
  // Advanced Webpack Configuration
  // =====================
  webpack: (config, { isServer }) => {
    // Production-only optimizations
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 244 * 1024,
          cacheGroups: {
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
          },
        },
        minimizer: config.optimization.minimizer.map((plugin) => {
          if (plugin.constructor.name === 'TerserPlugin') {
            plugin.options.terserOptions = {
              ...plugin.options.terserOptions,
              compress: {
                ...plugin.options.terserOptions?.compress,
                drop_console: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
              },
            };
          }
          return plugin;
        }),
      };

      config.performance = {
        maxAssetSize: 300 * 1024,
        maxEntrypointSize: 300 * 1024,
        hints: 'warning',
      };
    }

    // Important: return the modified config
    return config;
  },

  // =====================
  // Experimental Features
  // =====================
  experimental: {
    optimizeCss: true, // Disabled to prevent critters error
    scrollRestoration: true,
    outputFileTracingExcludes: {
      '**': ['**canvas**', '**@next/swc*/**'],
    },
    serverComponentsExternalPackages: ['sharp'],
    modularizeImports: {
      lodash: {
        transform: 'lodash/{{member}}',
        preventFullImport: true,
      },
      '@heroicons/react/24/outline': {
        transform: '@heroicons/react/24/outline/{{member}}',
        preventFullImport: true,
      },
    },
  },
};

module.exports = withBundleAnalyzer(nextConfig);
