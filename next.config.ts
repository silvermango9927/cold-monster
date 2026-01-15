import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Mark pdf-parse-new as external to avoid bundling issues
  serverExternalPackages: ["pdf-parse-new"],
};

export default nextConfig;
