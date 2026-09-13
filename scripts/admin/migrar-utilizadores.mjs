#!/usr/bin/env node
/**
 * Migração dos perfis criados no tempo do Firebase Auth para a autenticação própria.
 *
 * Uso:
 *   node scripts/admin/migrar-utilizadores.mjs              # ensaio: só relatório, não escreve
 *   node scripts/admin/migrar-utilizadores.mjs --aplicar    # aplica
 *   [--project <id>] [--database caridade]
 *
 * Credenciais: Application Default Credentials (`gcloud auth application-default login`)
 * ou emulador (`FIRESTORE_EMULATOR_HOST`).
 *
 * Para cada `utilizadores/{uid}`:
 *   - normaliza o e-mail (minúsculas, sem espaços);
 *   - cria o índice único `emails/{email}` → uid (reporta conflitos, não os resolve);
 *   - lista perfis sem palavra-passe: precisam de um código de acesso emitido no painel
 *     (Utilizadores → "Código de acesso").
 * Reporta ainda a colecção legada `admins` (deixa de ser usada).
 */
import { parseArgs } from 'node:util';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const { values: args } = parseArgs({
  options: {
    aplicar: { type: 'boolean', default: false },
    project: { type: 'string' },
    database: { type: 'string', default: 'caridade' },
  },
});

const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const projectId = args.project ?? process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? (emulador ? 'demo-caridade' : 'insjcm');
const db = getFirestore(initializeApp(emulador ? { projectId } : { credential: applicationDefault(), projectId }), args.database);

const mascarar = (email) => email.replace(/^(.).*(@.*)$/, '$1***$2');

const snap = await db.collection('utilizadores').get();
const porEmail = new Map();
const semPassword = [];
let indicesCriados = 0;
let emailsNormalizados = 0;

for (const doc of snap.docs) {
  const d = doc.data();
  const email = String(d.email ?? '').trim().toLowerCase();
  if (!email) {
    console.warn(`⚠️  ${doc.id}: perfil sem e-mail — ignorado`);
    continue;
  }
  if (porEmail.has(email)) {
    console.warn(`❌ conflito: ${mascarar(email)} em ${porEmail.get(email)} e ${doc.id} — resolva manualmente`);
    continue;
  }
  porEmail.set(email, doc.id);
  if (!d.passwordHash) semPassword.push(`${doc.id} (${mascarar(email)}, ${d.papel}/${d.estado})`);

  const idxRef = db.collection('emails').doc(email);
  const idx = await idxRef.get();
  if (idx.exists && idx.data().uid !== doc.id) {
    console.warn(`❌ índice ${mascarar(email)} aponta para ${idx.data().uid}, perfil é ${doc.id}`);
    continue;
  }
  if (args.aplicar) {
    if (email !== d.email) await doc.ref.update({ email });
    if (!idx.exists) await idxRef.create({ uid: doc.id, criadoEm: FieldValue.serverTimestamp() });
  }
  if (email !== d.email) emailsNormalizados++;
  if (!idx.exists) indicesCriados++;
}

const admins = await db.collection('admins').get();

console.log(`\n${args.aplicar ? 'APLICADO' : 'ENSAIO (use --aplicar)'} — projecto ${projectId}, base ${args.database}`);
console.log(`Perfis: ${snap.size} · índices de e-mail ${args.aplicar ? 'criados' : 'a criar'}: ${indicesCriados} · e-mails normalizados: ${emailsNormalizados}`);
console.log(`Sem palavra-passe (precisam de código de acesso): ${semPassword.length}`);
semPassword.forEach((l) => console.log(`  - ${l}`));
if (!admins.empty) console.log(`Colecção legada 'admins': ${admins.size} documento(s) — já não é usada; confirme que esses utilizadores têm papel 'admin'.`);
