import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Needed for Prisma in serverless/edge environments
  },
};

export default nextConfig;
