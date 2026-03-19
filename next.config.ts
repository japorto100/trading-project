import type { NextConfig } from "next";

/**
 * SOTA 2026 Elite Next.js Configuration
 * Optimized for: Turbopack Disk-Caching, React Compiler Efficiency, and Cross-Stack OTel
 */
const nextConfig: NextConfig = {
  // 1. Stable React Compiler (SOTA 2026 Standard)
  reactCompiler: true,

  // 2. Unified Caching Model (Next.js 16)
  // Standard in SOTA 2026: Everything is dynamic by default.
  // Requires removal of legacy 'force-dynamic' segment configs.
  cacheComponents: true,

  // 3. Performance & Observability
  experimental: {
    // Disabled: Causes restart loops on some Windows environments in 16.1.6
    turbopackFileSystemCacheForDev: false,
    
    // Aggressive import optimization for heavy SOTA suites
    optimizePackageImports: ['lucide-react', 'framer-motion', 'otplib', '@simplewebauthn/browser'],
  },

  // 4. Turbopack Domain-Specific Routing (SOTA 2026)
  // Ensures heavy assets/docs don't stall the dev bundler
  turbopack: {
    rules: {
      "*.md": ["ignore"],
      "*.pdf": ["ignore"],
    },
  },

  // 5. Interface & Security
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },

  // 6. Network & Preview Support
  allowedDevOrigins: [
    'preview-chat-2a7888ed-7aef-4428-9e61-9201d0565a86.space.z.ai',
    '.space.z.ai',
    '.z.ai',
  ],
};

export default nextConfig;
