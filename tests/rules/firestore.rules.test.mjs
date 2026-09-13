/**
 * Testes das regras Firestore (firestore.rules) no emulador.
 *
 * Uso: npm run test:rules
 * (arranca o emulador via firebase emulators:exec e corre `node --test tests/rules/`)
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

const ADMIN_EMAIL = 'benone.marcos@gmail.com';
let env;

before(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
  env = await initializeTestEnvironment({
    projectId: 'demo-caridade',
    // RULES_FILE permite provar que os testes apanham regressões (ex.: correr contra regras antigas).
    firestore: {
      rules: readFileSync(process.env.RULES_FILE ?? new URL('../../firestore.rules', import.meta.url), 'utf8'),
      host,
      port: Number(port),
    },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

/** Cria utilizadores/{uid} com as regras desactivadas (estado de partida). */
async function seedUser(uid, papel, estado, extra = {}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'utilizadores', uid), {
      uid,
      email: `${uid}@teste.local`,
      nomeCompleto: uid,
      papel,
      estado,
      ...extra,
    });
  });
}

async function seed(path, data) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

const visitor = () => env.unauthenticatedContext().firestore();
const user = (uid, token = {}) =>
  env.authenticatedContext(uid, { email: `${uid}@teste.local`, email_verified: true, ...token }).firestore();

const perfilPendente = (uid) => ({
  uid,
  email: `${uid}@teste.local`,
  nomeCompleto: 'Nova Pessoa',
  fotoUrl: null,
  papel: 'pendente',
  papelPretendido: 'voluntario',
  estado: 'pendente',
  criadoEm: serverTimestamp(),
});

// ─── Formulários públicos ──────────────────────────────────────────────────

describe('formulários públicos', () => {
  const voluntario = () => ({
    name: 'Ana',
    email: 'ana@exemplo.org',
    country: 'Portugal',
    countryCode: 'PT',
    phone: '+351900000000',
    interest: 'Organização e Logística',
    message: 'Quero ajudar',
    createdAt: serverTimestamp(),
  });

  test('visitante submete voluntário válido', async () => {
    await assertSucceeds(addDoc(collection(visitor(), 'voluntarios'), voluntario()));
  });

  test('visitante não injecta campos extra', async () => {
    await assertFails(addDoc(collection(visitor(), 'voluntarios'), { ...voluntario(), papel: 'admin' }));
  });

  test('visitante não forja o timestamp', async () => {
    await assertFails(addDoc(collection(visitor(), 'voluntarios'), { ...voluntario(), createdAt: new Date(0) }));
  });

  test('visitante não envia texto gigante', async () => {
    await assertFails(addDoc(collection(visitor(), 'voluntarios'), { ...voluntario(), message: 'x'.repeat(5001) }));
  });

  test('visitante não lê voluntários', async () => {
    await assertFails(getDocs(collection(visitor(), 'voluntarios')));
  });

  test('newsletter exige e-mail válido', async () => {
    await assertSucceeds(addDoc(collection(visitor(), 'newsletter_subscriptions'), { email: 'a@b.pt', subscribedAt: serverTimestamp() }));
    await assertFails(addDoc(collection(visitor(), 'newsletter_subscriptions'), { email: 'nao-e-email', subscribedAt: serverTimestamp() }));
  });

  test('beneficiário web exige consentimento', async () => {
    const base = {
      name: 'Família X', birthdate: '1990-01-01', id_number: 'AB123', country: 'Brasil', countryCode: 'BR',
      phone: '+5511900000000', email: '', address: 'Rua 1', adults: 2, children: 1, situation: 'Desemprego',
      supportNeeded: ['alimento', 'saude'], createdAt: serverTimestamp(),
    };
    await assertSucceeds(addDoc(collection(visitor(), 'beneficiarios'), { ...base, consent: true }));
    await assertFails(addDoc(collection(visitor(), 'beneficiarios'), { ...base, consent: false }));
    await assertFails(addDoc(collection(visitor(), 'beneficiarios'), { ...base, consent: true, supportNeeded: ['dinheiro'] }));
  });

  test('beneficiário com esquema da app Android', async () => {
    await assertSucceeds(addDoc(collection(visitor(), 'beneficiarios'), {
      nomeCompleto: 'Família Y', bi: '000', pais: 'Angola', dataNascimento: '', enderecoFisico: '',
      telefonePrincipal: '+244900000000', telefoneAlternativo: '', motivacao: '', necessidadeEspecifica: '',
    }));
  });

  test('contacto válido', async () => {
    await assertSucceeds(addDoc(collection(visitor(), 'contactos'), {
      name: 'Rui', email: 'rui@exemplo.org', country: 'Espanha', countryCode: 'ES', phone: '',
      subject: 'Olá', message: 'Mensagem', createdAt: serverTimestamp(),
    }));
  });
});

// ─── Utilizadores e escalada de privilégios ────────────────────────────────

describe('utilizadores', () => {
  test('novo utilizador cria o seu perfil pendente', async () => {
    await assertSucceeds(setDoc(doc(user('u1'), 'utilizadores', 'u1'), perfilPendente('u1')));
  });

  test('ESCALADA: novo utilizador não pode nascer admin aprovado', async () => {
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u1'), { ...perfilPendente('u1'), papel: 'admin', estado: 'aprovado' }));
  });

  test('ESCALADA: novo utilizador não pode nascer aprovado', async () => {
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u1'), { ...perfilPendente('u1'), estado: 'aprovado' }));
  });

  test('ESCALADA: novo utilizador não pode nascer coordenador', async () => {
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u1'), { ...perfilPendente('u1'), papel: 'coordenador' }));
  });

  test('não pode forjar aprovação nem e-mail de outra pessoa', async () => {
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u1'), { ...perfilPendente('u1'), aprovadoPor: 'x' }));
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u1'), { ...perfilPendente('u1'), email: ADMIN_EMAIL }));
  });

  test('não cria perfil de outro uid', async () => {
    await assertFails(setDoc(doc(user('u1'), 'utilizadores', 'u2'), perfilPendente('u2')));
  });

  test('admin bootstrap (e-mail verificado) cria perfil admin', async () => {
    const db = env.authenticatedContext('boot', { email: ADMIN_EMAIL, email_verified: true }).firestore();
    await assertSucceeds(setDoc(doc(db, 'utilizadores', 'boot'), {
      ...perfilPendente('boot'), email: ADMIN_EMAIL, papel: 'admin', estado: 'aprovado', papelPretendido: '',
    }));
  });

  test('e-mail do admin NÃO verificado não dá privilégios', async () => {
    const db = env.authenticatedContext('fake', { email: ADMIN_EMAIL, email_verified: false }).firestore();
    await assertFails(setDoc(doc(db, 'utilizadores', 'fake'), {
      ...perfilPendente('fake'), email: ADMIN_EMAIL, papel: 'admin', estado: 'aprovado',
    }));
  });

  test('ESCALADA: pendente não altera o próprio papel/estado', async () => {
    await seedUser('u1', 'pendente', 'pendente');
    await assertFails(updateDoc(doc(user('u1'), 'utilizadores', 'u1'), { papel: 'admin' }));
    await assertFails(updateDoc(doc(user('u1'), 'utilizadores', 'u1'), { estado: 'aprovado' }));
    await assertFails(updateDoc(doc(user('u1'), 'utilizadores', 'u1'), { papelPretendido: 'coordenador' }));
  });

  test('pendente altera nome e perfil pretendido', async () => {
    await seedUser('u1', 'pendente', 'pendente');
    await assertSucceeds(updateDoc(doc(user('u1'), 'utilizadores', 'u1'), { nomeCompleto: 'Outro', papelPretendido: 'beneficiario' }));
  });

  test('lê o próprio perfil mas não o de outros', async () => {
    await seedUser('u1', 'voluntario', 'aprovado');
    await seedUser('u2', 'voluntario', 'aprovado');
    await assertSucceeds(getDoc(doc(user('u1'), 'utilizadores', 'u1')));
    await assertFails(getDoc(doc(user('u1'), 'utilizadores', 'u2')));
    await assertFails(getDocs(collection(user('u1'), 'utilizadores')));
  });

  test('admin aprovado lista e aprova; admin suspenso não', async () => {
    await seedUser('adm', 'admin', 'aprovado');
    await seedUser('susp', 'admin', 'suspenso');
    await seedUser('u1', 'pendente', 'pendente');
    await assertSucceeds(getDocs(collection(user('adm'), 'utilizadores')));
    await assertSucceeds(updateDoc(doc(user('adm'), 'utilizadores', 'u1'), { papel: 'voluntario', estado: 'aprovado' }));
    await assertFails(getDocs(collection(user('susp'), 'utilizadores')));
  });
});

// ─── Eixos (equipa) ────────────────────────────────────────────────────────

describe('eixos operacionais e confidenciais', () => {
  const campanha = { data: '2026-09-13', nomeDoador: 'D', contacto: '', descricaoBem: 'Arroz', quantidade: '10', recebidoPor: 'V', criadoEm: serverTimestamp() };

  test('voluntário aprovado cria campanha; pendente e suspenso não', async () => {
    await seedUser('vol', 'voluntario', 'aprovado');
    await seedUser('pend', 'voluntario', 'pendente');
    await seedUser('susp', 'voluntario', 'suspenso');
    await assertSucceeds(addDoc(collection(user('vol'), 'campanhas'), campanha));
    await assertFails(addDoc(collection(user('pend'), 'campanhas'), campanha));
    await assertFails(addDoc(collection(user('susp'), 'campanhas'), campanha));
  });

  test('beneficiário não acede aos eixos', async () => {
    await seedUser('ben', 'beneficiario', 'aprovado');
    await assertFails(addDoc(collection(user('ben'), 'campanhas'), campanha));
    await assertFails(getDocs(collection(user('ben'), 'stock')));
  });

  test('campos extra em registos de eixo são rejeitados', async () => {
    await seedUser('vol', 'voluntario', 'aprovado');
    await assertFails(addDoc(collection(user('vol'), 'campanhas'), { ...campanha, hack: true }));
  });

  test('dados confidenciais (Eixo 3) só para gestão', async () => {
    await seedUser('vol', 'voluntario', 'aprovado');
    await seedUser('coord', 'coordenador', 'aprovado');
    await seed('necessidades/n1', { codigoFamilia: 'F1' });
    await assertFails(getDoc(doc(user('vol'), 'necessidades', 'n1')));
    await assertSucceeds(getDoc(doc(user('coord'), 'necessidades', 'n1')));
  });

  test('referências: profissional só se aprovado', async () => {
    await seedUser('prof', 'profissional', 'aprovado');
    await seedUser('profPend', 'profissional', 'pendente');
    await seed('referencias/r1', { nomeBeneficiario: 'X' });
    await assertSucceeds(getDoc(doc(user('prof'), 'referencias', 'r1')));
    await assertFails(getDoc(doc(user('profPend'), 'referencias', 'r1')));
  });
});

// ─── Pedidos de apoio ──────────────────────────────────────────────────────

describe('pedidos de apoio', () => {
  const pedido = (uid) => ({ uid, nomeBeneficiario: 'B', email: `${uid}@teste.local`, titulo: 'Ajuda', descricao: 'Texto', estado: 'novo', criadoEm: serverTimestamp() });

  test('beneficiário aprovado cria o seu pedido', async () => {
    await seedUser('ben', 'beneficiario', 'aprovado');
    await assertSucceeds(addDoc(collection(user('ben'), 'pedidosApoio'), pedido('ben')));
  });

  test('não cria pedido já resolvido nem em nome de outro', async () => {
    await seedUser('ben', 'beneficiario', 'aprovado');
    await assertFails(addDoc(collection(user('ben'), 'pedidosApoio'), { ...pedido('ben'), estado: 'resolvido' }));
    await assertFails(addDoc(collection(user('ben'), 'pedidosApoio'), pedido('outro')));
  });

  test('beneficiário pendente não cria pedidos', async () => {
    await seedUser('ben', 'beneficiario', 'pendente');
    await assertFails(addDoc(collection(user('ben'), 'pedidosApoio'), pedido('ben')));
  });

  test('beneficiário lista só os seus; não lê os de outros', async () => {
    await seedUser('ben', 'beneficiario', 'aprovado');
    await seed('pedidosApoio/p1', { uid: 'ben', titulo: 'meu', estado: 'novo' });
    await seed('pedidosApoio/p2', { uid: 'outro', titulo: 'alheio', estado: 'novo' });
    await assertSucceeds(getDocs(query(collection(user('ben'), 'pedidosApoio'), where('uid', '==', 'ben'))));
    await assertFails(getDoc(doc(user('ben'), 'pedidosApoio', 'p2')));
    await assertFails(getDocs(collection(user('ben'), 'pedidosApoio')));
  });

  test('só a gestão muda o estado', async () => {
    await seedUser('ben', 'beneficiario', 'aprovado');
    await seedUser('coord', 'coordenador', 'aprovado');
    await seed('pedidosApoio/p1', { uid: 'ben', titulo: 'meu', estado: 'novo' });
    await assertFails(updateDoc(doc(user('ben'), 'pedidosApoio', 'p1'), { estado: 'resolvido' }));
    await assertSucceeds(updateDoc(doc(user('coord'), 'pedidosApoio', 'p1'), { estado: 'em_analise' }));
    await assertFails(updateDoc(doc(user('coord'), 'pedidosApoio', 'p1'), { titulo: 'alterado' }));
  });
});

describe('catch-all', () => {
  test('coleção desconhecida é negada', async () => {
    await seedUser('adm', 'admin', 'aprovado');
    await assertFails(setDoc(doc(user('adm'), 'qualquerCoisa', 'x'), { a: 1 }));
  });
});
