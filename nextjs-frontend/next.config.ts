import type { NextConfig } from "next";
import path from "node:path";

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
  turbopack: {
    // The repo root, not this app: some dependencies (e.g. source-map-js) are
    // hoisted to ../node_modules, so Turbopack must be able to reach above
    // this directory. Absolute because Next 16 warns on a relative root.
    root: path.resolve(__dirname, ".."),
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "recharts", "leaflet"],
  },
  async redirects() {
    return [
      {
        source: "/ads",
        destination: "/services/ads",
        permanent: true,
      },
      {
        source: "/product-listing",
        destination: "/services/property-listing",
        permanent: true,
      },
      {
        source: "/properties/spacious-4br-family-home-in-suburban-atlanta",
        destination: "/properties",
        permanent: true,
      },
      {
        source: "/realtors/veronica-a-medellin",
        destination: "/agents",
        permanent: true,
      },
      {
        source: "/agents/veronica-a-medellin",
        destination: "/agents",
        permanent: true,
      },
    ];
  }
};

export default nextConfig;
