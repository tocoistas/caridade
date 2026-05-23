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
    default: "Projecto Caridade - INSJCM",
    template: "%s | Projecto Caridade - INSJCM",
  },
  description: "O Projecto Caridade é uma iniciativa do Departamento de Acção Social da Direcção Central das Senhoras da Igreja de Nosso Senhor Jesus Cristo no Mundo.",
  keywords: ["Caridade", "Doação", "Voluntariado", "Angola", "Assistência Social", "Igreja Tocoísta", "INSJCM"],
  authors: [{ name: "INSJCM" }],
  creator: "Igreja de Nosso Senhor Jesus Cristo no Mundo",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://caridade.ao'),
  openGraph: {
    title: "Projecto Caridade - Fé em Acção",
    description: "Uma iniciativa do Departamento de Acção Social da Direcção Central das Senhoras da Igreja de Nosso Senhor Jesus Cristo no Mundo.",
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

