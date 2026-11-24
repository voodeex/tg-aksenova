import type { NextConfig } from "next";

const isStatic =
  process.env.GITHUB_ACTIONS === "true" || process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const, trailingSlash: true } : {}),
  ...(basePath ? { basePath } : {}),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["three"],
  experimental: {
    optimizePackageImports: ["@react-three/drei", "motion"],
  },
};

export default nextConfig;
