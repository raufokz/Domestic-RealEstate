import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.domesticrealestate.us",
      },
    ],
  },
};

export default nextConfig;
