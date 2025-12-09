// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  // ❌ yaha koi distDir, output, custom build dir mat rakhna
  // distDir: ".js"  // <-- agar tha to hata diya
};

export default nextConfig;
