#!/usr/bin/env node
/**
 * Testes end-to-end da API (/api/v1) contra o emulador do Firestore.
 *
 * Uso: npm run build && npm run test:e2e
 *   (test:e2e corre este script dentro de `firebase emulators:exec`, que define
 *    FIRESTORE_EMULATOR_HOST e GCLOUD_PROJECT)
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error('FIRESTORE_EMULATOR_HOST não definido — use `npm run test:e2e`.');
  process.exit(1);
}

const PORT = process.env.E2E_PORT || '3200';
const BASE = `http://localhost:${PORT}`;
const env = { ...process.env, NODE_ENV: 'production', GCLOUD_PROJECT: process.env.GCLOUD_PROJECT || 'demo-caridade' };

const require = createRequire(import.meta.url);
const server = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'start', '-p', PORT], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env,
});
let log = '';
server.stdout.on('data', (d) => (log += d));
server.stderr.on('data', (d) => (log += d));
const stop = () => server.exitCode === null && server.kill('SIGTERM');
process.on('exit', stop);

const inicio = Date.now();
for (;;) {
  if (server.exitCode !== null) {
    console.error(`next start terminou:\n${log}`);
    process.exit(1);
  }
  try {
    if ((await fetch(`${BASE}/robots.txt`)).ok) break;
  } catch {
    /* a arrancar */
  }
  if (Date.now() - inicio > 60_000) {
    console.error(`timeout à espera do servidor\n${log}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 500));
}

const testes = spawn(process.execPath, ['--test', '--test-concurrency=1', 'tests/api/api.test.mjs'], {
  stdio: 'inherit',
  env: { ...env, BASE_URL: BASE },
});
testes.on('exit', (code) => {
  stop();
  if (code !== 0) console.error(`\n--- log do servidor ---\n${log.slice(-4000)}`);
  process.exit(code ?? 1);
});
