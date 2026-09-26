#!/usr/bin/env node
/**
 * Atribui códigos de identificação (BEN-/VOL-/PRO-) aos registos anteriores à
 * introdução dos códigos, e liga as acções já existentes ao cadastro quando o
 * nome corresponde sem ambiguidade.
 *
 * Uso:
 *   node scripts/admin/atribuir-codigos.mjs               # ensaio: só mostra o que faria
 *   node scripts/admin/atribuir-codigos.mjs --aplicar     # escreve
 *   [--project <id>] [--database caridade] [--sem-ligacoes]
 *
 * Credenciais: Application Default Credentials (`gcloud auth application-default login`)
 * ou emulador (FIRESTORE_EMULATOR_HOST). Correr o ensaio primeiro.
 *
 * A ligação de acções antigas é conservadora: só liga quando existe **um único**
 * cadastro com aquele nome. Os restantes ficam como estão, para serem
 * corrigidos à mão no painel — é preferível a um registo ligado à pessoa errada.
 */
import { parseArgs } from 'node:util';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const { values: args } = parseArgs({
  options: {
    aplicar: { type: 'boolean', default: false },
    project: { type: 'string' },
    database: { type: 'string', default: 'caridade' },
    'sem-ligacoes': { type: 'boolean', default: false },
  },
});

// Espelha src/lib/referencias.ts (o script corre fora do bundle da aplicação).
const TIPOS = {
  beneficiario: { colecao: 'beneficiarios', prefixo: 'BEN', campoNome: 'name' },
  voluntario: { colecao: 'voluntarios', prefixo: 'VOL', campoNome: 'name' },
  profissional: { colecao: 'profissionaisVoluntarios', prefixo: 'PRO', campoNome: 'nomeCompleto' },
};

const REFERENCIAS = {
  campanhas: [{ campoId: 'voluntarioId', campoCodigo: 'voluntarioCodigo', campoNome: 'recebidoPor', tipo: 'voluntario' }],
  distribuicoes: [
    { campoId: 'beneficiarioId', campoCodigo: 'codigoBeneficiario', campoNome: 'nomeBeneficiario', tipo: 'beneficiario' },
    { campoId: 'voluntarioId', campoCodigo: 'voluntarioCodigo', campoNome: 'voluntarioResponsavel', tipo: 'voluntario' },
  ],
  referencias: [
    { campoId: 'beneficiarioId', campoCodigo: 'beneficiarioCodigo', campoNome: 'nomeBeneficiario', tipo: 'beneficiario' },
    { campoId: 'profissionalId', campoCodigo: 'profissionalCodigo', campoNome: 'profissionalNome', tipo: 'profissional' },
  ],
  accoesPrevcao: [{ campoId: 'profissionalId', campoCodigo: 'profissionalCodigo', campoNome: 'oradorPrincipal', tipo: 'profissional' }],
  necessidades: [{ campoId: 'beneficiarioId', campoCodigo: 'beneficiarioCodigo', campoNome: 'beneficiarioNome', tipo: 'beneficiario' }],
  doacoesEspecificas: [
    { campoId: 'beneficiarioId', campoCodigo: 'beneficiarioCodigo', campoNome: 'beneficiarioNome', tipo: 'beneficiario' },
    { campoId: 'voluntarioId', campoCodigo: 'voluntarioCodigo', campoNome: 'voluntarioLogistico', tipo: 'voluntario' },
  ],
};

const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const projectId =
  args.project ?? process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? (emulador ? 'demo-caridade' : 'insjcm');
const db = getFirestore(
  initializeApp(emulador ? { projectId } : { credential: applicationDefault(), projectId }),
  args.database
);

const normalizar = (v) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();

console.log(`${args.aplicar ? 'APLICAR' : 'ENSAIO'} — projecto ${projectId}, base ${args.database}\n`);

// ── 1. Códigos em falta ────────────────────────────────────────────────────
// Numerados pela ordem de criação, para a sequência acompanhar o histórico.
const porTipo = {};
for (const [tipo, def] of Object.entries(TIPOS)) {
  const snap = await db.collection(def.colecao).get();
  const docs = snap.docs.sort((a, b) => (a.createTime?.toMillis() ?? 0) - (b.createTime?.toMillis() ?? 0));
  const semCodigo = docs.filter((d) => !d.get('codigo'));

  // O contador continua de onde o maior código existente ficou, por ano.
  const contadores = new Map();
  for (const doc of docs) {
    const m = /^([A-Z]{3})-(\d{4})-(\d+)$/.exec(doc.get('codigo') ?? '');
    if (m) contadores.set(m[2], Math.max(contadores.get(m[2]) ?? 0, Number(m[3])));
  }

  for (const doc of semCodigo) {
    const ano = (doc.get('createdAt')?.toDate?.() ?? doc.get('criadoEm')?.toDate?.() ?? doc.createTime?.toDate?.() ?? new Date())
      .getUTCFullYear();
    const proximo = (contadores.get(String(ano)) ?? 0) + 1;
    contadores.set(String(ano), proximo);
    const codigo = `${def.prefixo}-${ano}-${String(proximo).padStart(4, '0')}`;
    if (args.aplicar) await doc.ref.update({ codigo });
    if (!args.aplicar && semCodigo.indexOf(doc) < 3) console.log(`   ex.: ${doc.id} → ${codigo}`);
  }

  // Grava os contadores para os próximos códigos gerados pela API não colidirem.
  if (args.aplicar) {
    for (const [ano, valor] of contadores) {
      await db
        .collection('contadores')
        .doc(`${def.prefixo}-${ano}`)
        .set({ prefixo: def.prefixo, ano: Number(ano), valor, actualizadoEm: FieldValue.serverTimestamp() }, { merge: true });
    }
  }

  // Índice nome → cadastro, para a fase seguinte.
  const indice = new Map();
  for (const doc of docs) {
    const chave = normalizar(doc.get(def.campoNome));
    if (!chave) continue;
    const anterior = indice.get(chave);
    indice.set(chave, anterior ? { ambiguo: true } : { id: doc.id, codigo: doc.get('codigo') ?? '', ref: doc.ref });
  }
  porTipo[tipo] = indice;

  console.log(`• ${def.colecao}: ${semCodigo.length} de ${docs.length} sem código${args.aplicar ? ' → atribuído ✔' : ''}`);
}

if (args['sem-ligacoes']) process.exit(0);

// ── 2. Ligar acções antigas ao cadastro, pelo nome ─────────────────────────
console.log('');
for (const [colecao, refs] of Object.entries(REFERENCIAS)) {
  const snap = await db.collection(colecao).get();
  let ligados = 0;
  let ambiguos = 0;
  let semCadastro = 0;

  for (const doc of snap.docs) {
    const update = {};
    for (const ref of refs) {
      if (doc.get(ref.campoId)) continue;
      const nome = normalizar(doc.get(ref.campoNome));
      if (!nome) continue;
      // Os códigos podem ter acabado de ser atribuídos: relê quando preciso.
      const achado = porTipo[ref.tipo].get(nome);
      if (!achado) {
        semCadastro++;
        continue;
      }
      if (achado.ambiguo) {
        ambiguos++;
        continue;
      }
      const codigo = achado.codigo || (args.aplicar ? (await achado.ref.get()).get('codigo') : '');
      update[ref.campoId] = achado.id;
      if (codigo) update[ref.campoCodigo] = codigo;
      ligados++;
    }
    if (args.aplicar && Object.keys(update).length) await doc.ref.update(update);
  }

  console.log(
    `• ${colecao}: ${ligados} referência(s) ligada(s)${args.aplicar ? ' ✔' : ''}` +
      (ambiguos ? `, ${ambiguos} nome(s) repetido(s) — ligar à mão` : '') +
      (semCadastro ? `, ${semCadastro} sem cadastro correspondente` : '')
  );
}

console.log(
  '\nO que ficou por ligar mantém o nome em texto e pode ser corrigido no painel.' +
    '\nRegistos novos passam sempre pelo cadastro.'
);
