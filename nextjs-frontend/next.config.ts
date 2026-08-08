import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.domesticrealestate.us",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  compress: true,
  // @ts-ignore - turbopack config not typed in NextConfig
  turbopack: {
    root: "./",
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts", "leaflet"],
  }
};

export default nextConfig;
