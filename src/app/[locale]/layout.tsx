import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { routing, localeDirection, type Locale } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import Analytics from "@/components/Analytics";
import ConsentimentoCookies from "@/components/ConsentimentoCookies";
import { BASE_URL, metadadosPagina } from "@/lib/seo";

// Tipos de letra servidos pela própria aplicação (src/assets/fonts).
//
// São fontes variáveis: um ficheiro por família cobre todos os pesos. Ficam no
// repositório em vez de virem de `next/font/google` porque esse plugin as
// descarrega do Google **durante o build** — uma dependência de rede que já
// fez falhar o CI, e um pedido a terceiros que o projecto não quer ter.
// Licenças e proveniência em src/assets/fonts/LICENCA.md.
const montserrat = localFont({
  src: "../../assets/fonts/Montserrat.woff2",
  variable: "--font-montserrat",
  weight: "400 700",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const lora = localFont({
  src: "../../assets/fonts/Lora.woff2",
  variable: "--font-lora",
  weight: "400 600",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#3D5A80",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const brand = t("title");

  return {
    // Canonical, hreflang, Open Graph e Twitter por omissão (as páginas refinam).
    ...metadadosPagina({ locale, titulo: t("ogTitle"), descricao: t("description") }),
    metadataBase: new URL(BASE_URL),
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    applicationName: brand,
    keywords: t.raw("keywords") as string[],
    authors: [{ name: brand, url: BASE_URL }],
    creator: brand,
    publisher: brand,
    category: "nonprofit",
    formatDetection: { telephone: false, email: false, address: false },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale as Locale);
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const tBrand = await getTranslations({ locale, namespace: "brand" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${lora.variable} ${montserrat.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <JsonLd descricao={tMeta("description")} tagline={tBrand("tagline")} />
        <NextIntlClientProvider>
          <a href="#conteudo" className="saltar-conteudo font-montserrat text-sm">
            {tNav("saltarConteudo")}
          </a>
          <Header />
          {children}
          <Footer />
          <ConsentimentoCookies />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
