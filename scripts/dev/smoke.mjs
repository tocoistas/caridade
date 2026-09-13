#!/usr/bin/env node
/**
 * Smoke test HTTP: arranca `next start` sobre o build existente e verifica rotas
 * públicas em vários idiomas, robots/sitemap e a página 404.
 *
 * Uso: npm run build && npm run smoke     (SMOKE_PORT=3123 por omissão)
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const PORT = process.env.SMOKE_PORT || '3123';
// Usar `localhost` e não fixar -H: com `next start -H 127.0.0.1` o middleware do
// next-intl devolve 307 para o próprio caminho (o rewrite interno aponta para localhost).
const BASE = `http://localhost:${PORT}`;

const CHECKS = [
  { path: '/', status: 200, includes: ['lang="pt"', 'dir="ltr"'] },
  { path: '/voluntario', status: 200 },
  { path: '/cadastro-beneficiario', status: 200 },
  { path: '/contacto', status: 200 },
  { path: '/doar-dinheiro', status: 200 },
  { path: '/doar-bens', status: 200 },
  { path: '/politica-privacidade', status: 200 },
  { path: '/termos-servico', status: 200 },
  { path: '/exclusao-dados', status: 200 },
  { path: '/admin', status: 200 },
  { path: '/en', status: 200, includes: ['lang="en"'] },
  { path: '/fr/voluntario', status: 200, includes: ['lang="fr"'] },
  { path: '/ar', status: 200, includes: ['lang="ar"', 'dir="rtl"'] },
  { path: '/robots.txt', status: 200, includes: ['Sitemap:'] },
  { path: '/sitemap.xml', status: 200, includes: ['<urlset'] },
  { path: '/esta-pagina-nao-existe', status: 404 },
  // Detecção de idioma: um browser em inglês que abre a raiz é redireccionado para /en.
  { path: '/', status: 307, lang: 'en-US,en;q=0.9', location: '/en' },
];

const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const server = spawn(process.execPath, [nextBin, 'start', '-p', PORT], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'production' },
});
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));

const stop = () => server.exitCode === null && server.kill('SIGTERM');
process.on('exit', stop);

async function waitReady(timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (server.exitCode !== null) throw new Error(`next start terminou (código ${server.exitCode})\n${serverLog}`);
    try {
      const res = await fetch(`${BASE}/robots.txt`);
      if (res.ok) return;
    } catch {
      /* ainda a arrancar */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`timeout à espera do servidor\n${serverLog}`);
}

let failures = 0;
try {
  await waitReady();
  for (const { path, status, includes = [], lang = 'pt-PT,pt;q=0.9', location } of CHECKS) {
    // Accept-Language explícito: sem ele o next-intl pode redireccionar para outro idioma.
    const res = await fetch(BASE + path, { redirect: 'manual', headers: { 'accept-language': lang } });
    const body = await res.text();
    const missing = includes.filter((s) => !body.includes(s));
    const loc = res.headers.get('location') ?? '';
    const locationOk = !location || new URL(loc, BASE).pathname === location;
    if (!locationOk) missing.push(`location ${location} (recebido ${loc || '—'})`);
    const ok = res.status === status && missing.length === 0;
    if (!ok) failures++;
    console.log(
      `${ok ? '✅' : '❌'} ${path} [${lang.split(',')[0]}] → ${res.status}` +
        (res.status !== status ? ` (esperado ${status})` : '') +
        (missing.length ? ` — em falta: ${missing.join(', ')}` : '')
    );
  }
} catch (err) {
  console.error(`❌ ${err.message}`);
  failures++;
} finally {
  stop();
}

if (failures) {
  console.error(`\nSmoke test falhou (${failures}).`);
  process.exit(1);
}
console.log(`\n✅ Smoke test OK (${CHECKS.length} verificações).`);
