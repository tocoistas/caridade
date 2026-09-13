#!/usr/bin/env node
/**
 * Bootstrap e reposição da conta de administrador (autenticação própria).
 *
 * Uso:
 *   node scripts/admin/bootstrap-admin.mjs --email <e-mail> [--nome "Nome"] [--reset] [--gerar]
 *                                          [--project <id>] [--database caridade]
 *
 * Credenciais (nada fica no código nem no repositório):
 *   - produção: Application Default Credentials de alguém com acesso ao Firestore do projecto
 *     (`gcloud auth application-default login`);
 *   - testes: emulador (`FIRESTORE_EMULATOR_HOST`, projecto em `GCLOUD_PROJECT`).
 *
 * Palavra-passe:
 *   - pedida no terminal, sem eco, duas vezes;
 *   - ou lida do stdin quando não é um terminal (ex.: `printf '%s\n' "$PW" | node …`);
 *   - ou `--gerar`: gera uma aleatória, mostrada UMA vez, com troca obrigatória no 1.º acesso.
 *
 * Comportamento:
 *   - não existe conta com o e-mail            → cria administrador aprovado;
 *   - existe sem palavra-passe (perfil migrado) → define a palavra-passe e garante admin aprovado;
 *   - existe com palavra-passe                  → exige --reset: repõe a palavra-passe, reactiva,
 *                                                 garante papel admin, invalida códigos e revoga sessões.
 */
import { randomBytes, randomInt, scrypt } from 'node:crypto';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const PASSWORD_MIN = 10;
const PASSWORD_MAX = 128;
// Tem de coincidir com src/server/crypto.ts.
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;

const { values: args } = parseArgs({
  options: {
    email: { type: 'string' },
    nome: { type: 'string' },
    reset: { type: 'boolean', default: false },
    gerar: { type: 'boolean', default: false },
    project: { type: 'string' },
    database: { type: 'string', default: 'caridade' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

function sair(mensagem, codigo = 1) {
  console.error(mensagem);
  process.exit(codigo);
}

if (args.help || !args.email) {
  sair('Uso: node scripts/admin/bootstrap-admin.mjs --email <e-mail> [--nome "Nome"] [--reset] [--gerar] [--project <id>]', args.help ? 0 : 1);
}

const email = args.email.trim().toLowerCase();
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) sair('E-mail inválido.');

function hashPassword(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password.normalize('NFKC'), salt, KEYLEN, { N, r: R, p: P, maxmem: 256 * N * R }, (err, key) =>
      err ? reject(err) : resolve(['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$'))
    )
  );
}

function gerarPassword() {
  const alfabeto = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 20 }, () => alfabeto[randomInt(alfabeto.length)]).join('');
}

function perguntarOculto(pergunta) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let silenciar = false;
    rl._writeToOutput = (texto) => {
      if (!silenciar) rl.output.write(texto);
    };
    rl.question(pergunta, (resposta) => {
      rl.close();
      process.stdout.write('\n');
      resolve(resposta);
    });
    silenciar = true;
  });
}

async function lerStdin() {
  let dados = '';
  for await (const parte of process.stdin) dados += parte;
  return dados.split(/\r?\n/)[0] ?? '';
}

async function obterPassword() {
  if (args.gerar) return gerarPassword();
  if (!process.stdin.isTTY) return lerStdin();
  const p1 = await perguntarOculto('Nova palavra-passe do administrador: ');
  const p2 = await perguntarOculto('Repita a palavra-passe: ');
  if (p1 !== p2) sair('As palavras-passe não coincidem.');
  return p1;
}

const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const projectId = args.project ?? process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? (emulador ? 'demo-caridade' : 'insjcm');
const app = initializeApp(emulador ? { projectId } : { credential: applicationDefault(), projectId });
const db = getFirestore(app, args.database);

async function procurarPorEmail() {
  const idx = await db.collection('emails').doc(email).get();
  if (idx.exists) return idx.data().uid;
  const q = await db.collection('utilizadores').where('email', '==', email).limit(1).get();
  return q.empty ? null : q.docs[0].id;
}

async function main() {
  console.log(`Projecto: ${projectId} · base: ${args.database}${emulador ? ' · EMULADOR' : ''}`);
  const uidExistente = await procurarPorEmail();
  const existente = uidExistente ? (await db.collection('utilizadores').doc(uidExistente).get()).data() : null;

  if (existente?.passwordHash && !args.reset) {
    sair(`Já existe uma conta com palavra-passe para ${email}. Use --reset para a repor.`);
  }

  const password = await obterPassword();
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    sair(`A palavra-passe tem de ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`);
  }
  const passwordHash = await hashPassword(password);

  let uid = uidExistente;
  await db.runTransaction(async (tx) => {
    const idxRef = db.collection('emails').doc(email);
    const idx = await tx.get(idxRef);
    if (idx.exists && idx.data().uid !== (uid ?? idx.data().uid)) {
      throw new Error(`O índice de e-mail aponta para outra conta (${idx.data().uid}). Corrija manualmente.`);
    }
    const ref = uid ? db.collection('utilizadores').doc(uid) : db.collection('utilizadores').doc();
    uid = ref.id;
    if (!idx.exists) tx.create(idxRef, { uid, criadoEm: FieldValue.serverTimestamp() });

    const comum = {
      email,
      papel: 'admin',
      estado: 'aprovado',
      passwordHash,
      alterarPassword: args.gerar,
      aprovadoPor: 'bootstrap',
      aprovadoEm: FieldValue.serverTimestamp(),
    };
    if (existente) {
      tx.update(ref, {
        ...comum,
        ...(args.nome ? { nomeCompleto: args.nome } : {}),
        codigoAcessoHash: FieldValue.delete(),
        codigoAcessoExpiraEm: FieldValue.delete(),
        codigoAcessoEmitidoPor: FieldValue.delete(),
      });
    } else {
      tx.create(ref, {
        ...comum,
        uid,
        nomeCompleto: args.nome ?? 'Administrador',
        fotoUrl: null,
        papelPretendido: '',
        criadoEm: FieldValue.serverTimestamp(),
      });
    }
  });

  const sessoes = await db.collection('sessoes').where('uid', '==', uid).get();
  if (!sessoes.empty) {
    const batch = db.batch();
    sessoes.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  const accao = !existente ? 'criado' : existente.passwordHash ? 'reposto' : 'activado (perfil migrado)';
  console.log(`✅ Administrador ${accao}: ${email} (uid ${uid}). Sessões revogadas: ${sessoes.size}.`);
  if (args.gerar) {
    console.log(`\nPalavra-passe temporária (mostrada só agora; troca obrigatória no 1.º acesso):\n\n    ${password}\n`);
  }
}

main().catch((err) => sair(`❌ ${err.message}`));
