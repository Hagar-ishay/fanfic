import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "epub",
    "epub-gen",
    "tough-cookie",
    "axios-cookiejar-support",
  ], // Explicitly include tough-cookie and axios-cookiejar-support
  experimental: {
    dynamicIO: true,
  },
  webpack: (config) => {
    config.externals = {
      ...config.externals,
      "tough-cookie": "commonjs tough-cookie",
      "axios-cookiejar-support": "commonjs axios-cookiejar-support",
    };
    return config;
  },
};

export default nextConfig;
