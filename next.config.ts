import type { NextConfig } from "next";
import "@/config";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    
    // Enable React 19 features
    ppr: true,
    useCache: true,
    // reactCompiler: {
    //   compilationMode: 'annotation',
    // },
    
    // Performance optimizations
    optimizeServerReact: true,
    clientRouterFilter: true,
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
  
  // Enhanced caching
  cacheHandler: process.env.NODE_ENV === 'production' ? require.resolve('./cache-handler.js') : undefined,
  cacheMaxMemorySize: 0, // disable default in-memory caching
};

export default nextConfig;
