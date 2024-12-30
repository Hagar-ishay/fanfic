import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "epub",
    "epub-gen",
    "tough-cookie",
    "axios-cookiejar-support",
  ],
  redirects: async () => [
    {
      source: "/",
      destination: "/library",
      permanent: true,
    },
  ],
};

export default nextConfig;
