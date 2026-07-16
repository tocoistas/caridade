#!/usr/bin/env node
/**
 * Tradução automática dos catálogos i18n.
 *
 * Lê `messages/pt.json` (idioma fonte) e gera `messages/<locale>.json` para
 * cada idioma alvo, através de tradução automática. Preserva os marcadores ICU
 * (`{ano}`) e as etiquetas HTML (`<strong>`) para não serem traduzidos.
 *
 * Uso:
 *   node scripts/translate.mjs            # traduz todos os idiomas alvo
 *   node scripts/translate.mjs --only=en,fr
 *   node scripts/translate.mjs --force    # ignora a cache e re-traduz tudo
 *
 * O provider por omissão é o endpoint público do Google Translate (sem chave).
 * Pode ser substituído definindo TRANSLATE_ENDPOINT / a função `translateText`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '..', 'messages');
const SOURCE_LOCALE = 'pt';

// locale da app -> código do Google Translate
const TARGETS = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  it: 'it',
  zh: 'zh-CN',
  ar: 'ar',
  ru: 'ru',
  hi: 'hi',
  ja: 'ja',
};

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.replace('--only=', '').split(',') : null;

const OPEN = '';
const CLOSE = '';

/** Protege {placeholders} e <tags> substituindo-os por marcadores privados. */
function protect(text) {
  const tokens = [];
  const protectedText = text.replace(/(\{[^}]+\}|<\/?[^>]+>)/g, (m) => {
    const i = tokens.length;
    tokens.push(m);
    return `${OPEN}${i}${CLOSE}`;
  });
  return { protectedText, tokens };
}

/**
 * Restaura os marcadores no texto traduzido. O marcador de fecho é tolerado
 * como opcional porque alguns motores de tradução (ex.: japonês) podem removê-lo,
 * deixando apenas `OPEN + índice`.
 */
function restore(text, tokens) {
  return text.replace(
    new RegExp(`${OPEN}\\s*(\\d+)\\s*${CLOSE}?`, 'g'),
    (_, i) => tokens[Number(i)] ?? ''
  );
}

async function translateText(text, target, attempt = 0) {
  const trimmed = text.trim();
  if (!trimmed) return text;
  const { protectedText, tokens } = protect(text);

  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${SOURCE_LOCALE}&tl=${target}&dt=t&q=` +
    encodeURIComponent(protectedText);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 caridade-i18n' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const translated = (data[0] || []).map((seg) => seg[0]).join('');
    return restore(translated, tokens);
  } catch (err) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      return translateText(text, target, attempt + 1);
    }
    throw new Error(`Falha ao traduzir "${text.slice(0, 40)}…" → ${target}: ${err.message}`);
  }
}

/** Traduz recursivamente um valor (string, array ou objeto). */
async function translateValue(value, target, cache) {
  if (typeof value === 'string') {
    if (!force && cache.has(value)) return cache.get(value);
    const out = await translateText(value, target);
    cache.set(value, out);
    return out;
  }
  if (Array.isArray(value)) {
    const out = [];
    for (const item of value) out.push(await translateValue(item, target, cache));
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await translateValue(v, target, cache);
    return out;
  }
  return value;
}

async function main() {
  const source = JSON.parse(await readFile(join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`), 'utf8'));
  const locales = Object.keys(TARGETS).filter((l) => !only || only.includes(l));

  for (const locale of locales) {
    const target = TARGETS[locale];
    // Cache de strings idênticas dentro do mesmo idioma (evita pedidos repetidos).
    const cache = new Map();
    process.stdout.write(`→ ${locale} (${target}) … `);
    const translated = await translateValue(source, target, cache);
    await writeFile(
      join(MESSAGES_DIR, `${locale}.json`),
      JSON.stringify(translated, null, 2) + '\n',
      'utf8'
    );
    console.log(`ok (${cache.size} strings únicas)`);
  }
  console.log('Concluído.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
