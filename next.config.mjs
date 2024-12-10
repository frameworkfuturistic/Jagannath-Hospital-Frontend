/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      // Appointment Image API
      {
        protocol: "https",
        hostname: "appointment.sjhrc.in",
        pathname: "/hospital-api/**", // Match all images under /hospital-api/
      },
      // Appointment Image API
      {
        protocol: "https",
        hostname: "sjhrc.in",
        pathname: "/hospital-api/**", // Match all images under /hospital-api/
      },

      // Appointment Image API
      {
        protocol: "https",
        hostname: "sjhrc.in",
        pathname: "/backend/**", // Match all images under /hospital-api/
      },

      // Appointment Image API
      {
        protocol: "https",
        hostname: "appointment.sjhrc.in",
        pathname: "/**", // Match all images under /hospital-api/
      },
      // LoremFlickr for random placeholder images
      {
        protocol: "https",
        hostname: "loremflickr.com",
        pathname: "/640/**", // Match all images with 640px width
      },
      // Pexels for free stock photos
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/photos/**", // Match all photos on Pexels
      },
      // Gratisography for free high-resolution photos
      {
        protocol: "https",
        hostname: "gratisography.com",
        pathname: "/wp-content/uploads/**", // Match all images under wp-content/uploads
      },
      // Unsplash for free high-quality images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo/**", // Match all image paths in Unsplash
      },
      // External domain (azbigmedia.com example)
      {
        protocol: "https",
        hostname: "azbigmedia.com",
        pathname: "/wp-content/uploads/**", // Allow images from azbigmedia.com
      },
      // Localhost development (HTTP allowed)
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**", // Match any path under localhost
      },
    ],
    // Optional: Set the device sizes for responsiveness
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Add additional sizes if necessary
    formats: ["image/webp", "image/avif"], // Optional: Fallback formats for better image compression
  },
  // Add any other production-specific configurations here
};

export default nextConfig;
