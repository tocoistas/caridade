/**
 * Cabeçalhos de segurança HTTP aplicados a todas as respostas (next.config.ts → headers()).
 *
 * CSP: o Next.js App Router injecta scripts inline de hidratação, pelo que `script-src`
 * precisa de 'unsafe-inline' (sem nonces por pedido). Os únicos terceiros permitidos são os
 * do Google Analytics, que só é carregado após consentimento (src/components/Analytics.tsx).
 * Alterar = rever docs/privacidade/subcontratantes.md.
 */
const GOOGLE_ANALYTICS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
];

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${GOOGLE_ANALYTICS[0]}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${GOOGLE_ANALYTICS.join(' ')}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GOOGLE_ANALYTICS.join(' ')}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const CABECALHOS_SEGURANCA = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
];
