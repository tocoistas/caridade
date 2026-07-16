import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O Firebase App Hosting corre o servidor Next.js em Cloud Run (SSR),
  // por isso não usamos `output: "export"` (exportação estática).
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
