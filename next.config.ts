import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't get confused by a
  // stray package-lock.json in the home directory. Without this,
  // Next infers the root from the nearest lockfile and warns.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
