'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { EVENTO_CONSENTIMENTO, lerConsentimento, type Consentimento } from '@/lib/privacidade';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '';
const GA_VALIDO = /^G-[A-Z0-9]{4,20}$/.test(GA_ID);

/**
 * Google Analytics 4 carregado APENAS depois de consentimento para estatísticas.
 * Sem consentimento não é feito nenhum pedido à Google nem são criados cookies.
 * Retirar o consentimento desactiva o envio (ga-disable) e apaga os cookies _ga*.
 */
export default function Analytics() {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    const aplicar = (c: Consentimento | null) => {
      const ok = Boolean(c?.analytics);
      if (GA_VALIDO) (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = !ok;
      setPermitido(ok);
    };
    const id = window.setTimeout(() => aplicar(lerConsentimento()), 0);
    const ouvir = (e: Event) => aplicar((e as CustomEvent<Consentimento>).detail);
    window.addEventListener(EVENTO_CONSENTIMENTO, ouvir);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener(EVENTO_CONSENTIMENTO, ouvir);
    };
  }, []);

  if (!GA_VALIDO || !permitido) return null;

  return (
    <>
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());
gtag('config','${GA_ID}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});`}
      </Script>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
    </>
  );
}
