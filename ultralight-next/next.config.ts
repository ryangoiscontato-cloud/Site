import type { NextConfig } from "next";

// ELECTRON_BUILD=true produces a static `out/` export consumed by the
// desktop app (electron/main.js). The Hostinger web deploy keeps the
// default server build untouched.
const nextConfig: NextConfig = {
  ...(process.env.ELECTRON_BUILD === 'true' ? { output: 'export' } : {}),
};

export default nextConfig;
