/**
 * Testes das regras Firestore no emulador.
 *
 * Com a autenticação própria, TODO o acesso passa pela API do servidor (Admin SDK).
 * As regras têm de negar qualquer leitura/escrita directa de clientes — incluindo
 * utilizadores Firebase Auth "antigos" e o e-mail de admin verificado.
 *
 * Uso: npm run test:rules
 */
import { readFileSync } from 'node:fs';
import { after, before, describe, test } from 'node:test';
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';

const ontology = JSON.parse(readFileSync(new URL('../../docs/ontology.json', import.meta.url), 'utf8'));
const COLECOES = Object.keys(ontology.collections);
let env;

before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
  env = await initializeTestEnvironment({
    projectId: 'demo-caridade',
    firestore: {
      rules: readFileSync(process.env.RULES_FILE ?? new URL('../../firestore.rules', import.meta.url), 'utf8'),
      host,
      port: Number(port),
    },
  });
  await env.withSecurityRulesDisabled(async (ctx) => {
    for (const c of COLECOES) await setDoc(doc(ctx.firestore(), c, 'existente'), { uid: 'u1', papel: 'admin', estado: 'aprovado' });
  });
});

after(async () => {
  await env?.cleanup();
});

const clientes = () => ({
  visitante: env.unauthenticatedContext().firestore(),
  autenticado: env.authenticatedContext('u1', { email: 'u1@teste.local', email_verified: true }).firestore(),
  'e-mail de admin verificado': env.authenticatedContext('adm', { email: 'admin@teste.local', email_verified: true, admin: true }).firestore(),
});

describe('acesso directo ao Firestore é sempre negado', () => {
  for (const colecao of COLECOES) {
    test(colecao, async () => {
      for (const db of Object.values(clientes())) {
        await assertFails(getDoc(doc(db, colecao, 'existente')));
        await assertFails(getDocs(collection(db, colecao)));
        await assertFails(addDoc(collection(db, colecao), { campo: 'x', criadoEm: serverTimestamp() }));
        await assertFails(setDoc(doc(db, colecao, 'u1'), { uid: 'u1', papel: 'admin', estado: 'aprovado' }));
      }
    });
  }

  test('coleção desconhecida', async () => {
    for (const db of Object.values(clientes())) {
      await assertFails(setDoc(doc(db, 'qualquerCoisa', 'x'), { a: 1 }));
    }
  });
});
