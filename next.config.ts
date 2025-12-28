import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com", // Google Auth images
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com", // GitHub Auth images
      },
    ],
  },
};

export default nextConfig;