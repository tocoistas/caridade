#!/usr/bin/env node
/**
 * Aplica os prazos de conservação definidos em docs/privacidade/retencao.md.
 *
 * Uso:
 *   node scripts/admin/aplicar-retencao.mjs              # ensaio: só conta o que seria afectado
 *   node scripts/admin/aplicar-retencao.mjs --aplicar    # elimina/anonimiza
 *   [--project <id>] [--database caridade]
 *
 * Credenciais: Application Default Credentials (gcloud auth application-default login)
 * ou emulador (FIRESTORE_EMULATOR_HOST). É uma acção de produção: correr o ensaio primeiro.
 * Documentos sem o campo de data são ignorados e contados à parte (rever manualmente).
 */
import { parseArgs } from 'node:util';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

const { values: args } = parseArgs({
  options: {
    aplicar: { type: 'boolean', default: false },
    project: { type: 'string' },
    database: { type: 'string', default: 'caridade' },
  },
});

// Manter alinhado com docs/privacidade/retencao.md.
const REGRAS = [
  { colecao: 'contactos', campo: 'createdAt', meses: 24, accao: 'eliminar' },
  { colecao: 'voluntarios', campo: 'createdAt', meses: 36, accao: 'eliminar' },
  { colecao: 'profissionaisVoluntarios', campo: 'criadoEm', meses: 36, accao: 'eliminar' },
  { colecao: 'pedidosTitulares', campo: 'createdAt', meses: 36, accao: 'eliminar' },
  {
    colecao: 'beneficiarios',
    campo: 'createdAt',
    meses: 60,
    accao: 'anonimizar',
    manter: ['country', 'countryCode', 'adults', 'children', 'supportNeeded', 'createdAt', 'pais'],
  },
  { colecao: 'pedidosApoio', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['estado', 'criadoEm'] },
  { colecao: 'distribuicoes', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['data', 'descricaoApoio', 'criadoEm'] },
  { colecao: 'campanhas', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['data', 'descricaoBem', 'quantidade', 'criadoEm'] },
  { colecao: 'referencias', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['data', 'criadoEm'] },
  { colecao: 'accoesPrevcao', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['titulo', 'dataHora', 'localFisico', 'publicoAlvo', 'criadoEm'] },
  { colecao: 'necessidades', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['statusGeral', 'criadoEm'] },
  { colecao: 'doacoesEspecificas', campo: 'criadoEm', meses: 60, accao: 'anonimizar', manter: ['dataRecebimento', 'descricaoItem', 'dataRemessa', 'criadoEm'] },
  { colecao: 'utilizadores', campo: 'ultimoLoginEm', meses: 24, accao: 'rever' },
];

const emulador = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const projectId = args.project ?? process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? (emulador ? 'demo-caridade' : 'insjcm');
const db = getFirestore(initializeApp(emulador ? { projectId } : { credential: applicationDefault(), projectId }), args.database);

function limite(meses) {
  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return Timestamp.fromDate(d);
}

console.log(`${args.aplicar ? 'APLICAR' : 'ENSAIO'} — projecto ${projectId}, base ${args.database}\n`);

for (const regra of REGRAS) {
  const antigos = await db.collection(regra.colecao).where(regra.campo, '<', limite(regra.meses)).get();
  const alvo = antigos.docs.filter((d) => !(regra.accao === 'anonimizar' && d.get('anonimizadoEm')));

  if (regra.accao === 'rever') {
    console.log(`• ${regra.colecao}: ${alvo.length} conta(s) sem login há mais de ${regra.meses} meses — avisar e eliminar manualmente (não automático).`);
    continue;
  }

  if (args.aplicar) {
    for (let i = 0; i < alvo.length; i += 400) {
      const batch = db.batch();
      for (const doc of alvo.slice(i, i + 400)) {
        if (regra.accao === 'eliminar') {
          batch.delete(doc.ref);
        } else {
          const apagar = Object.keys(doc.data())
            .filter((k) => !regra.manter.includes(k))
            .reduce((acc, k) => ({ ...acc, [k]: FieldValue.delete() }), {});
          batch.update(doc.ref, { ...apagar, anonimizadoEm: FieldValue.serverTimestamp() });
        }
      }
      await batch.commit();
    }
  }
  console.log(`• ${regra.colecao}: ${alvo.length} documento(s) com mais de ${regra.meses} meses → ${regra.accao}${args.aplicar ? ' ✔' : ''}`);
}

console.log('\nNota: documentos sem o campo de data não são abrangidos — rever manualmente (ex.: registos antigos da app sem criadoEm).');
