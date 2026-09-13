/**
 * Privacidade no cliente: versão da política e consentimento de cookies.
 * Ver docs/privacidade/ e a skill privacy-compliance.
 */

/**
 * Versão da política de privacidade. Incrementar quando houver alteração material
 * (novos dados, finalidades ou destinatários): os consentimentos gravados passam a
 * referir a nova versão e o banner de cookies volta a ser apresentado.
 */
export const VERSAO_POLITICA = '2026-09-13';

const CHAVE = 'caridade-consentimento';
/** O consentimento de cookies é pedido de novo ao fim de 6 meses. */
const VALIDADE_MS = 180 * 24 * 60 * 60 * 1000;

export const EVENTO_CONSENTIMENTO = 'caridade:consentimento';
export const EVENTO_ABRIR_PREFERENCIAS = 'caridade:preferencias-cookies';

export interface Consentimento {
  versao: string;
  data: string;
  analytics: boolean;
}

/** Consentimento válido guardado neste browser, ou null (nunca decidido, expirado ou de outra versão). */
export function lerConsentimento(): Consentimento | null {
  if (typeof window === 'undefined') return null;
  try {
    const c = JSON.parse(window.localStorage.getItem(CHAVE) ?? 'null') as Consentimento | null;
    if (!c || c.versao !== VERSAO_POLITICA || Date.now() - Date.parse(c.data) > VALIDADE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export function guardarConsentimento(analytics: boolean): Consentimento {
  const c: Consentimento = { versao: VERSAO_POLITICA, data: new Date().toISOString(), analytics };
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(c));
  } catch {
    /* modo privado: a escolha vale só para esta página */
  }
  if (!analytics) apagarCookiesAnalytics();
  window.dispatchEvent(new CustomEvent<Consentimento>(EVENTO_CONSENTIMENTO, { detail: c }));
  return c;
}

export function abrirPreferenciasCookies(): void {
  window.dispatchEvent(new Event(EVENTO_ABRIR_PREFERENCIAS));
}

/** Remove os cookies do Google Analytics (_ga, _ga_*, _gid) após retirada do consentimento. */
export function apagarCookiesAnalytics(): void {
  const host = window.location.hostname;
  const dominios = ['', host, `.${host.replace(/^www\./, '')}`];
  const nomes = document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((n) => n === '_ga' || n === '_gid' || n.startsWith('_ga_'));
  for (const nome of nomes) {
    for (const d of dominios) {
      document.cookie = `${nome}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ''}`;
    }
  }
}
