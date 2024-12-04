import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["epub", "epub-gen"],
  experimental: {
    dynamicIO: true,
  },
};

export default nextConfig;
