import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import { routing, localeDirection, type Locale } from "@/i18n/routing";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const brand = t("title");

  return {
    title: {
      default: brand,
      template: `%s | ${brand}`,
    },
    description: t("description"),
    keywords: ["Caridade", "Doação", "Voluntariado", "Solidariedade", "Assistência Social", "Global", "Beneficiários"],
    authors: [{ name: brand }],
    creator: brand,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://caridade.ao"),
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "https://caridade.ao",
      siteName: brand,
      locale,
      type: "website",
    },
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
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
