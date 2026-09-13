#!/usr/bin/env node
/**
 * Tradução automática dos catálogos i18n.
 *
 * Lê `messages/pt.json` (idioma fonte) e gera `messages/<locale>.json` para
 * cada idioma alvo, através de tradução automática. Preserva os marcadores ICU
 * (`{ano}`) e as etiquetas HTML (`<strong>`) para não serem traduzidos.
 *
 * Uso:
 *   node scripts/translate.mjs                       # incremental: só chaves em falta ou com marcadores partidos
 *   node scripts/translate.mjs --only=en,fr          # limita os idiomas
 *   node scripts/translate.mjs --keys=home,form.email # re-traduz estas chaves (prefixos) mesmo que existam
 *   node scripts/translate.mjs --force               # re-traduz tudo
 *
 * Limites do endpoint (HTTP 429): pausa TRANSLATE_DELAY_MS entre pedidos (150 ms) e espera exponencial.
 * Nunca correr vários idiomas em paralelo.
 *
 * Marcadores ICU e etiquetas nunca são enviados ao tradutor: o texto é partido
 * nos marcadores e só os segmentos de texto são traduzidos (o método antigo, com
 * caracteres privados, era corrompido pelo tradutor em zh/ar/hi).
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
const argList = (name) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).split(',').filter(Boolean) : null;
};
const only = argList('only');
const keys = argList('keys');

const TOKEN = /(\{[^}]+\}|<\/?[^>]+>)/;

/** Assinatura de marcadores/etiquetas — igual à de scripts/check-i18n.mjs. */
function signature(value) {
  const s = String(value);
  const placeholders = [...s.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]).sort();
  const tags = [...s.matchAll(/<\/?([a-zA-Z][\w-]*)\s*\/?>/g)].map((m) => m[0].replace(/\s+/g, '')).sort();
  return JSON.stringify([placeholders, tags]);
}

// O endpoint público limita pedidos por IP (HTTP 429). Pausa entre pedidos e, em 429,
// espera exponencial (30 s, 60 s, 120 s, 240 s, 480 s) antes de desistir.
const DELAY_MS = Number(process.env.TRANSLATE_DELAY_MS ?? 150);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Endpoint alternativo (dict-chrome-ex). Resposta: ["texto"] ou [["texto","pt"]].
 * Devolve null se também estiver indisponível.
 */
async function translateAlternativa(text, target) {
  const url =
    'https://clients5.google.com/translate_a/t' +
    `?client=dict-chrome-ex&sl=${SOURCE_LOCALE}&tl=${target}&q=` +
    encodeURIComponent(text);
  try {
    await sleep(DELAY_MS);
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 caridade-i18n' } });
    if (!res.ok) return null;
    const data = await res.json();
    const primeiro = Array.isArray(data) ? data[0] : null;
    const texto = Array.isArray(primeiro) ? primeiro[0] : primeiro;
    return typeof texto === 'string' && texto.trim() ? texto : null;
  } catch {
    return null;
  }
}

async function translateRaw(text, target, attempt = 0) {
  const url =
    'https://translate.googleapis.com/translate_a/single' +
    `?client=gtx&sl=${SOURCE_LOCALE}&tl=${target}&dt=t&q=` +
    encodeURIComponent(text);
  await sleep(DELAY_MS);
  let status = 0;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 caridade-i18n' } });
    status = res.status;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (data[0] || []).map((seg) => seg[0]).join('');
  } catch (err) {
    const limite = status === 429;
    // Alternativa gratuita da mesma API quando o endpoint principal limita o IP.
    if (limite) {
      const alternativa = await translateAlternativa(text, target);
      if (alternativa !== null) return alternativa;
    }
    if (attempt < (limite ? 5 : 4)) {
      const espera = limite ? 30_000 * 2 ** attempt : 500 * (attempt + 1);
      if (limite) console.warn(`\n  limite de pedidos (429) — nova tentativa em ${espera / 1000} s`);
      await sleep(espera);
      return translateRaw(text, target, attempt + 1);
    }
    throw new Error(`Falha ao traduzir "${text.slice(0, 40)}…" → ${target}: ${err.message}`);
  }
}

/** Traduz apenas os segmentos de texto entre marcadores, preservando-os intactos. */
async function translateText(text, target) {
  const parts = text.split(TOKEN);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i % 2 === 1 || !part.trim()) {
      out.push(part);
      continue;
    }
    const lead = part.match(/^\s*/)[0];
    const trail = part.match(/\s*$/)[0];
    out.push(lead + (await translateRaw(part.trim(), target)) + trail);
  }
  return out.join('');
}

const selected = (path) => keys?.some((k) => path === k || path.startsWith(`${k}.`)) ?? false;

/** Traduz recursivamente, reutilizando traduções existentes válidas. */
async function translateValue(value, existing, target, cache, path, stats) {
  if (typeof value === 'string') {
    const reusable =
      !force && !selected(path) && typeof existing === 'string' && signature(existing) === signature(value);
    if (reusable) return existing;
    if (!cache.has(value)) cache.set(value, await translateText(value, target));
    stats.translated++;
    return cache.get(value);
  }
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) {
      out.push(await translateValue(value[i], Array.isArray(existing) ? existing[i] : undefined, target, cache, `${path}.${i}`, stats));
    }
    return out;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const sub = existing && typeof existing === 'object' ? existing[k] : undefined;
      out[k] = await translateValue(v, sub, target, cache, path ? `${path}.${k}` : k, stats);
    }
    return out;
  }
  return value;
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return undefined;
  }
}

async function main() {
  const source = await readJson(join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`));
  const locales = Object.keys(TARGETS).filter((l) => !only || only.includes(l));

  for (const locale of locales) {
    const target = TARGETS[locale];
    const file = join(MESSAGES_DIR, `${locale}.json`);
    const existing = await readJson(file);
    const cache = new Map();
    const stats = { translated: 0 };
    process.stdout.write(`→ ${locale} (${target}) … `);
    const translated = await translateValue(source, existing, target, cache, '', stats);
    await writeFile(file, JSON.stringify(translated, null, 2) + '\n', 'utf8');
    console.log(`ok (${stats.translated} strings traduzidas)`);
  }
  console.log('Concluído. Valide com: npm run check:i18n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
