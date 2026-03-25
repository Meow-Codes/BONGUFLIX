import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname, // pins root to the client/ folder
  },
};

export default nextConfig;
