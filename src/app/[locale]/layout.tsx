import type { Metadata, Viewport } from "next";
import { Montserrat, Lora } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { routing, localeDirection, type Locale } from "@/i18n/routing";
import JsonLd from "@/components/JsonLd";
import { BASE_URL, metadadosPagina } from "@/lib/seo";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600"],
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
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
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

  return (
    <html
      lang={locale}
      dir={localeDirection(locale)}
      className={`${lora.variable} ${montserrat.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9TRGQ6GQJ0"></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9TRGQ6GQJ0');
          `}
        </Script>
      </head>
      <body>
        <JsonLd descricao={tMeta("description")} tagline={tBrand("tagline")} />
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
