/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Core Configuration
  reactStrictMode: false, // Kept from your working code
  output: 'standalone',
  trailingSlash: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,

  // Console Management
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'], // Allow warnings for debugging
          }
        : false,
  },

  // Image Optimization
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
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'azbigmedia.com',
        pathname: '/**',
      },
      // Development only
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '',
              pathname: '/**',
            },
          ]
        : []),
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    loader: 'default',
    unoptimized: false,
  },

  // Production Optimizations
  compress: true,
  swcMinify: true,
  optimizeFonts: true,

  // Security Headers
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
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/default-image.jpg',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  // Environment Configuration
  env: {
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'production',
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL || 'https://sjhrc.in',
  },

  // Webpack Configuration
  webpack: (config, { isServer }) => {
    if (process.env.NODE_ENV === 'production') {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 250000, // Reduced to prevent build issues
          cacheGroups: {
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-is)[\\/]/,
              name: 'react',
              chunks: 'all',
              priority: 20,
            },
            vendors: {
              test: /[\\/]node_modules[\\/](?!react|react-dom|react-is)/,
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
                drop_console: false, // Preserve console for debugging
                pure_funcs: ['console.debug'],
              },
            };
          }
          return plugin;
        }),
      };

      config.performance = {
        maxAssetSize: 300000,
        maxEntrypointSize: 300000,
        hints: 'warning',
      };
    }

    // Add aliases for better module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@components': `${__dirname}/components`,
      '@lib': `${__dirname}/lib`,
    };

    return config;
  },

  // Experimental Features
  experimental: {
    scrollRestoration: true,
    serverComponentsExternalPackages: ['sharp'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
