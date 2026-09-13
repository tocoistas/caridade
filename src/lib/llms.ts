import { routing } from '@/i18n/routing';
import en from '../../messages/en.json';
import pt from '../../messages/pt.json';
import { BASE_URL, NOME_SITE, urlAbsoluto } from './seo';

/**
 * Conteúdo para modelos de linguagem (https://llmstxt.org): /llms.txt (índice) e
 * /llms-full.txt (conteúdo completo). Gerado a partir de messages/*.json para
 * ficar sempre alinhado com o site.
 */

type Mensagens = typeof pt;

const PAGINAS = [
  { path: '', ns: 'metadata', titulo: 'title', descricao: 'description' },
  { path: '/voluntario', ns: 'voluntario', titulo: 'metaTitle', descricao: 'metaDescription' },
  { path: '/doar-bens', ns: 'doarBens', titulo: 'metaTitle', descricao: 'metaDescription' },
  { path: '/doar-dinheiro', ns: 'doarDinheiro', titulo: 'metaTitle', descricao: 'metaDescription' },
  { path: '/cadastro-beneficiario', ns: 'cadastroPage', titulo: 'metaTitle', descricao: 'metaDescription' },
  { path: '/contacto', ns: 'contacto', titulo: 'metaTitle', descricao: 'metaDescription' },
] as const;

const LEGAIS = [
  { path: '/politica-privacidade', ns: 'privacidade' },
  { path: '/termos-servico', ns: 'termos' },
  { path: '/exclusao-dados', ns: 'exclusao' },
] as const;

const semEtiquetas = (s: string) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function texto(m: Mensagens, ns: string, chave: string): string {
  const v = (m as unknown as Record<string, Record<string, unknown>>)[ns]?.[chave];
  return typeof v === 'string' ? semEtiquetas(v) : '';
}

function listaPaginas(m: Mensagens, locale: string): string {
  return PAGINAS.map((p) => `- [${texto(m, p.ns, p.titulo)}](${urlAbsoluto(locale, p.path)}): ${texto(m, p.ns, p.descricao)}`).join('\n');
}

export function llmsTxt(): string {
  return `# ${NOME_SITE}

> ${texto(en, 'metadata', 'description')}

${texto(pt, 'metadata', 'description')}

Independent, secular and global solidarity initiative. Primary language: Portuguese (pt-PT); the site is also available in ${routing.locales.filter((l) => l !== 'pt').join(', ')} (machine-translated). Operations are organised in three axes: goods (campaigns, stock, deliveries), health (professional volunteers, referrals, prevention) and confidential needs matched with donors.

## Páginas principais (pt)

${listaPaginas(pt, 'pt')}

## Main pages (en)

${listaPaginas(en, 'en')}

## Languages

${routing.locales.map((l) => `- ${l}: ${urlAbsoluto(l)}`).join('\n')}

## Contact

- Email: info@caridade.ao
- Contact form: ${urlAbsoluto('en', '/contacto')}

## Optional

- [Full content (pt + en)](${BASE_URL}/llms-full.txt)
${LEGAIS.map((l) => `- [${texto(en, l.ns, 'title')}](${urlAbsoluto('en', l.path)})`).join('\n')}
- The reserved area (/admin) and the API (/api) are private and must not be indexed.
`;
}

/** Converte um namespace de mensagens em Markdown legível (ignora metadados e rótulos de formulário). */
function namespaceParaMarkdown(valor: unknown, nivel = 3): string {
  if (typeof valor === 'string') return semEtiquetas(valor);
  if (Array.isArray(valor)) return valor.map((v) => `- ${semEtiquetas(String(v))}`).join('\n');
  if (valor && typeof valor === 'object') {
    return Object.entries(valor)
      .filter(([k]) => !/^(meta|form|success|error|placeholder|submit|label|consent)/i.test(k))
      .map(([, v]) => namespaceParaMarkdown(v, nivel + 1))
      .filter(Boolean)
      .join('\n\n');
  }
  return '';
}

function seccaoIdioma(m: Mensagens, locale: string, cabecalho: string): string {
  const ns = ['home', 'voluntario', 'doarBens', 'doarDinheiro', 'cadastroPage', 'contacto'] as const;
  const blocos = ns.map((n, i) => {
    const pagina = PAGINAS[i === 0 ? 0 : PAGINAS.findIndex((p) => p.ns === n)];
    const titulo = n === 'home' ? texto(m, 'metadata', 'title') : texto(m, n, 'metaTitle');
    return `### ${titulo}\n\nURL: ${urlAbsoluto(locale, pagina?.path ?? '')}\n\n${namespaceParaMarkdown((m as Record<string, unknown>)[n])}`;
  });
  return `## ${cabecalho}\n\n${blocos.join('\n\n')}`;
}

export function llmsFullTxt(): string {
  return `# ${NOME_SITE} — conteúdo completo

> ${texto(en, 'metadata', 'description')}

Fonte: ${BASE_URL}. Conteúdo gerado a partir dos textos oficiais do site (pt-PT é a versão de referência).

${seccaoIdioma(pt, 'pt', 'Português (pt-PT)')}

${seccaoIdioma(en, 'en', 'English')}
`;
}
