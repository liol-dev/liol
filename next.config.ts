import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't get confused by a
  // stray package-lock.json in the home directory. Without this,
  // Next infers the root from the nearest lockfile and warns.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Remote hosts the Next <Image> optimizer is allowed to fetch +
  // optimize. ImageKit is where real photos live; Unsplash covers
  // the seeded placeholders until Corey & Ed upload their own.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
