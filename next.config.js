/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      // Main domains for Appointment API
      {
        protocol: "https",
        hostname: "sjhrc.in",
        pathname: "/**", // Allow all paths
      },
      
      {
        protocol: "https",
        hostname: "sjhrc.in",
        pathname: "/uploads/**",
      },


      // Placeholder and stock image sources
      {
        protocol: "https",
        hostname: "loremflickr.com",
        pathname: "/640/**", // Placeholder images with 640px width
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**", // Pexels photos
      },
      {
        protocol: "https",
        hostname: "gratisography.com",
        pathname: "/wp-content/uploads/**", // Gratisography images
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo/**", // Unsplash photos
      },

      // External example domain
      {
        protocol: "https",
        hostname: "azbigmedia.com",
        pathname: "/wp-content/uploads/**", // Example external domain
      },

      // Local development environment
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**", // Allow all paths during local development
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/**", // Allow all paths during local development
      },
    ],

    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],

    // Additional image sizes for custom use cases
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Supported formats for optimized images
    formats: ["image/webp", "image/avif"],
  },
};

module.exports = nextConfig;
