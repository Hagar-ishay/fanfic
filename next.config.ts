import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
  },
  serverExternalPackages: [
    "epub",
    "epub-gen",
    "tough-cookie",
    "axios-cookiejar-support",
  ],
  redirects: async () => [
    {
      source: "/",
      destination: "/home",
      permanent: true,
    },
  ],
};

export default nextConfig;
