import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { CABECALHOS_SEGURANCA } from "./src/lib/seguranca";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Deploy exclusivo no Firebase App Hosting (servidor Next.js em Cloud Run, SSR).
  // Admin SDK (gRPC) fica fora do bundle do servidor.
  serverExternalPackages: ['firebase-admin'],
  // Cabeçalhos de segurança em todas as respostas (CSP, HSTS, …) — ver src/lib/seguranca.ts.
  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_SEGURANCA }];
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
