import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Allow cross-origin requests from preview domains
  allowedDevOrigins: [
    'preview-chat-2a7888ed-7aef-4428-9e61-9201d0565a86.space.z.ai',
    '.space.z.ai',
    '.z.ai',
  ],
};

export default nextConfig;
