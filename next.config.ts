import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Necessário para Turbopack compilar next-mdx-remote (workaround oficial).
  // Ver: https://github.com/vercel/next.js/issues/64525
  transpilePackages: ["next-mdx-remote"],
};

export default nextConfig;
