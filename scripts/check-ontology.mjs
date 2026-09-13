#!/usr/bin/env node
/**
 * Valida que a ontologia (docs/ontology.json) está alinhada com o código:
 *   - firestore.rules: deny-all se accessModel = "server"; senão coleções == ontologia
 *   - coleções em src/lib/adminCollections.ts (e os seus campos) ⊆ ontologia
 *   - coleções usadas em src/ (collection(db,'x') / doc(db,'x')) ⊆ ontologia
 *   - papéis (type Papel em src/lib/roles.ts) == ontology.roles
 *   - idiomas (src/i18n/routing.ts) == ontology.locales
 *   - (local, se existir ../mobile) coleções usadas na app Android ⊆ ontologia
 *
 * Uso: npm run check:ontology
 */
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFile(join(ROOT, p), 'utf8');
const errors = [];
const warnings = [];

const ontology = JSON.parse(await read('docs/ontology.json'));
const O = new Set(Object.keys(ontology.collections));

const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
const diff = (a, b) => [...a].filter((x) => !b.has(x));

// ── firestore.rules ────────────────────────────────────────────────────────
const rules = await read('firestore.rules');
const R = new Set(
  [...rules.matchAll(/match\s+\/(\w+)\/\{\w+\}/g)].map((m) => m[1]).filter((name) => name !== 'databases')
);
if (ontology.accessModel === 'server') {
  // Acesso só pelo servidor: as regras têm de negar tudo e não declarar coleções.
  if (R.size) errors.push(`firestore.rules declara coleções (${[...R].join(', ')}) mas accessModel é "server" (deny-all)`);
  if (!/match\s+\/\{document=\*\*\}\s*\{\s*allow read, write: if false;\s*\}/.test(rules)) {
    errors.push('firestore.rules tem de conter apenas o catch-all `allow read, write: if false`');
  }
} else if (!sameSet(R, O)) {
  if (diff(R, O).length) errors.push(`firestore.rules tem coleções fora da ontologia: ${diff(R, O).join(', ')}`);
  if (diff(O, R).length) errors.push(`ontologia tem coleções sem regra em firestore.rules: ${diff(O, R).join(', ')}`);
}

// ── adminCollections.ts ────────────────────────────────────────────────────
const admin = await read('src/lib/adminCollections.ts');
const blocks = admin.split(/\n\s*\{\s*\n\s*id:\s*'/).slice(1);
for (const block of blocks) {
  const id = block.slice(0, block.indexOf("'"));
  if (!O.has(id)) {
    errors.push(`adminCollections.ts: coleção '${id}' não existe na ontologia`);
    continue;
  }
  const def = ontology.collections[id];
  const known = new Set([...(def.fields ?? []), ...(def.mobileFields ?? [])]);
  const body = block.split(/\n\s*\},?\s*\n\s*\{\s*\n\s*id:/)[0];
  for (const [, key] of body.matchAll(/key:\s*'(\w+)'/g)) {
    if (!known.has(key)) errors.push(`adminCollections.ts: campo '${id}.${key}' não existe na ontologia`);
  }
  const ts = body.match(/timestampField:\s*'(\w+)'/)?.[1];
  if (ts && def.timestamp && ts !== def.timestamp) {
    errors.push(`adminCollections.ts: timestampField de '${id}' é '${ts}', ontologia diz '${def.timestamp}'`);
  }
}

// ── uso de coleções em src/ ────────────────────────────────────────────────
async function walk(dir, exts) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(p, exts)));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(p);
  }
  return out;
}
const ficheiros = [
  ...(await walk(join(ROOT, 'src'), ['.ts', '.tsx', '.js', '.jsx'])),
  ...(existsSync(join(ROOT, 'scripts', 'admin')) ? await walk(join(ROOT, 'scripts', 'admin'), ['.mjs']) : []),
];
for (const file of ficheiros) {
  const src = await readFile(file, 'utf8');
  for (const [, name] of src.matchAll(/(?:(?:collection|doc)\(\s*db\s*,\s*|\.collection\(\s*)['"](\w+)['"]/g)) {
    if (!O.has(name)) errors.push(`${file.slice(ROOT.length + 1)}: usa coleção '${name}' que não existe na ontologia`);
  }
}

// ── papéis ────────────────────────────────────────────────────────────────
const roles = await read('src/lib/roles.ts');
const papelType = roles.match(/export type Papel =([^;]+);/)?.[1] ?? '';
const P = new Set([...papelType.matchAll(/'(\w+)'/g)].map((m) => m[1]));
if (!sameSet(P, new Set(ontology.roles))) {
  errors.push(`roles.ts (type Papel) = [${[...P]}] ≠ ontology.roles = [${ontology.roles}]`);
}

// ── idiomas ───────────────────────────────────────────────────────────────
const routing = await read('src/i18n/routing.ts');
const localesSrc = routing.match(/export const locales = \[([\s\S]*?)\] as const/)?.[1] ?? '';
const L = new Set([...localesSrc.matchAll(/'([a-z]{2})'/g)].map((m) => m[1]));
if (!sameSet(L, new Set(ontology.locales))) {
  errors.push(`routing.ts locales = [${[...L]}] ≠ ontology.locales = [${ontology.locales}]`);
}

// ── app Android (só localmente, quando o workspace tem ../mobile) ─────────
const mobileSrc = join(ROOT, '..', 'mobile', 'app', 'src', 'main', 'kotlin');
if (existsSync(mobileSrc)) {
  for (const file of await walk(mobileSrc, ['.kt'])) {
    const src = await readFile(file, 'utf8');
    for (const [, name] of src.matchAll(/collection\(\s*"(\w+)"\s*\)/g)) {
      if (!O.has(name)) warnings.push(`mobile ${file.split('/kotlin/')[1]}: coleção '${name}' não existe na ontologia`);
    }
  }
}

for (const w of warnings) console.warn(`⚠️  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`❌ ${e}`);
  console.error(`\nOntologia desalinhada (${errors.length} erro(s)). Actualize docs/ontology.{md,json} ou o código.`);
  process.exit(1);
}
console.log(`✅ Ontologia alinhada: ${O.size} coleções, ${P.size} papéis, ${L.size} idiomas.`);
