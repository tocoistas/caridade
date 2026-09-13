import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Deploy exclusivo no Firebase App Hosting (servidor Next.js em Cloud Run, SSR).
  // Admin SDK (gRPC) fica fora do bundle do servidor.
  serverExternalPackages: ['firebase-admin'],
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
