import type { NextConfig } from "next";
import "@/config";

const nextConfig: NextConfig = {
  experimental: {
    // cacheComponents: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
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
  compress: true,
  poweredByHeader: false,
  generateBuildId: async () => "build-" + Date.now(),
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  output: "standalone",
};

export default nextConfig;
