import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

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

export const metadata: Metadata = {
  title: {
    default: "Projecto Caridade",
    template: "%s | Projecto Caridade",
  },
  description: "O Projecto Caridade é uma iniciativa independente e global de solidariedade que apoia pessoas e famílias em situação de vulnerabilidade, com bens essenciais, apoio à saúde e ligação a doadores.",
  keywords: ["Caridade", "Doação", "Voluntariado", "Solidariedade", "Assistência Social", "Global", "Beneficiários"],
  authors: [{ name: "Projecto Caridade" }],
  creator: "Projecto Caridade",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao'),
  openGraph: {
    title: "Projecto Caridade - Solidariedade em Acção",
    description: "Iniciativa independente e global de solidariedade: bens essenciais, apoio à saúde e ligação entre doadores e beneficiários.",
    url: "https://caridade.ao",
    siteName: "Projecto Caridade",
    locale: "pt_PT",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${lora.variable} ${montserrat.variable}`} data-scroll-behavior="smooth">
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
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

