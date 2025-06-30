import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // For Vercel Pro/Enterprise with Fluid compute enabled
  // Uncomment the line below and adjust maxDuration as needed
  // maxDuration: 300, // 5 minutes for hobby plan, up to 800 for pro/enterprise
};

export default nextConfig;
