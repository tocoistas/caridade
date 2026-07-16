import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

export default withNextIntl(nextConfig);
