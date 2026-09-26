import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { CABECALHOS_SEGURANCA } from "./src/lib/seguranca";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Recursos estáticos: ficam em `src/assets/` e são importados pelos componentes,
// para o build os emitir em `/_next/static/…`. NÃO usar `public/`: no Firebase
// App Hosting os ficheiros de `public/` não chegam a ser servidos (devolvem 404 em
// produção, mesmo estando no repositório e no build local) — foi assim que os
// ícones da aplicação estiveram partidos. Ícones do separador e do ecrã inicial
// usam as convenções do App Router (`src/app/icon.png`, `src/app/apple-icon.png`).
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
  // A rota /og lê o logótipo do disco: garante que o ficheiro entra no bundle.
  outputFileTracingIncludes: {
    '/og/[locale]': ['./src/assets/logo.png'],
  },
  turbopack: {
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
