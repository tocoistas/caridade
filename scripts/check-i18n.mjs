#!/usr/bin/env node
/**
 * Valida os catálogos i18n contra a fonte (messages/pt.json):
 *   - todos os idiomas têm exactamente as mesmas chaves que pt;
 *   - os marcadores ICU ({nome}) e as etiquetas (<strong>) são preservados.
 *
 * Uso: npm run check:i18n
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'messages');
const SOURCE = 'pt';

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  );

const signature = (value) => {
  const s = String(value);
  const placeholders = [...s.matchAll(/\{\s*(\w+)/g)].map((m) => m[1]).sort();
  const tags = [...s.matchAll(/<\/?([a-zA-Z][\w-]*)\s*\/?>/g)].map((m) => m[0].replace(/\s+/g, '')).sort();
  return JSON.stringify([placeholders, tags]);
};

const load = async (locale) => new Map(flatten(JSON.parse(await readFile(join(DIR, `${locale}.json`), 'utf8'))));

const source = await load(SOURCE);
const locales = (await readdir(DIR)).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).filter((l) => l !== SOURCE);

let problems = 0;
for (const locale of locales.sort()) {
  const target = await load(locale);
  const missing = [...source.keys()].filter((k) => !target.has(k));
  const extra = [...target.keys()].filter((k) => !source.has(k));
  const broken = [...source.keys()].filter((k) => target.has(k) && signature(source.get(k)) !== signature(target.get(k)));

  for (const k of missing) console.error(`❌ ${locale}: falta a chave ${k}`);
  for (const k of extra) console.error(`❌ ${locale}: chave a mais ${k}`);
  for (const k of broken) console.error(`❌ ${locale}: marcadores/etiquetas diferentes em ${k}`);
  problems += missing.length + extra.length + broken.length;
}

if (problems) {
  console.error(`\n${problems} problema(s). Edite só messages/pt.json e corra \`npm run translate\`.`);
  process.exit(1);
}
console.log(`✅ i18n consistente: ${source.size} chaves × ${locales.length + 1} idiomas.`);
