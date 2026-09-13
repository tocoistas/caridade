/**
 * Testes end-to-end da API com autenticação própria (servidor real + emulador Firestore).
 * Corre via `npm run test:e2e` (scripts/dev/e2e.mjs). Os testes são sequenciais e partilham estado.
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const BASE = process.env.BASE_URL;
const ORIGIN = new URL(BASE).origin;
const COOKIE = 'caridade-sessao';

class Cliente {
  cookie = '';
  bearer = '';

  async pedido(caminho, { method, body, origin = true, headers = {} } = {}) {
    const metodo = method ?? (body === undefined ? 'GET' : 'POST');
    const h = { ...headers };
    if (body !== undefined) h['content-type'] = 'application/json';
    if (this.cookie) h.cookie = this.cookie;
    if (this.bearer) h.authorization = `Bearer ${this.bearer}`;
    if (origin && metodo !== 'GET') h.origin = ORIGIN;
    const res = await fetch(`${BASE}/api/v1${caminho}`, {
      method: metodo,
      headers: h,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const c of res.headers.getSetCookie()) {
      const [par] = c.split(';');
      const i = par.indexOf('=');
      if (par.slice(0, i) === COOKIE) this.cookie = par.slice(i + 1) ? par : '';
    }
    return { status: res.status, data: await res.json().catch(() => ({})), headers: res.headers };
  }
}

const bootstrap = (argumentos, password) =>
  execFileSync(process.execPath, ['scripts/admin/bootstrap-admin.mjs', ...argumentos], {
    input: password === undefined ? '' : `${password}\n`,
    env: process.env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

const ADMIN = { email: 'admin@teste.local', password: 'PalavraPasseAdmin#1' };
const VOL = { nome: 'Vera Voluntária', email: 'Vera@Teste.local', password: 'PalavraPasseVera#1', papelPretendido: 'voluntario', aceitaPolitica: true, maiorDe16: true };
const BEN = { nome: 'Beto Beneficiário', email: 'beto@teste.local', password: 'PalavraPasseBeto#1', papelPretendido: 'beneficiario', aceitaPolitica: true, maiorDe16: true };

const admin = new Cliente();
const vol = new Cliente();
const ben = new Cliente();
const ids = {};

// ─── Bootstrap do administrador ────────────────────────────────────────────

test('bootstrap cria o administrador e este inicia sessão', async () => {
  const out = bootstrap(['--email', ADMIN.email, '--nome', 'Admin Teste'], ADMIN.password);
  assert.match(out, /Administrador criado/);
  assert.doesNotMatch(out, new RegExp(ADMIN.password), 'o script não pode imprimir a palavra-passe');

  const r = await admin.pedido('/auth/login', { body: { email: ADMIN.email, password: ADMIN.password } });
  assert.equal(r.status, 200);
  assert.equal(r.data.utilizador.papel, 'admin');
  assert.equal(r.data.token, undefined, 'na web o token só vai no cookie');
  assert.ok(admin.cookie, 'cookie de sessão definido');
  assert.match(r.headers.get('set-cookie'), /HttpOnly/i);
  assert.equal(r.data.utilizador.passwordHash, undefined, 'hash nunca é exposto');
});

test('bootstrap sem --reset recusa sobrescrever uma conta com palavra-passe', () => {
  assert.throws(() => bootstrap(['--email', ADMIN.email], 'OutraPalavraPasse#2'), /--reset/);
});

test('bootstrap --reset repõe a palavra-passe e revoga as sessões', async () => {
  const nova = 'NovaPalavraPasseAdmin#3';
  assert.match(bootstrap(['--email', ADMIN.email, '--reset'], nova), /reposto/);
  assert.equal((await admin.pedido('/auth/sessao')).status, 401);
  assert.equal((await admin.pedido('/auth/login', { body: { email: ADMIN.email, password: ADMIN.password } })).status, 401);
  ADMIN.password = nova;
  assert.equal((await admin.pedido('/auth/login', { body: { email: ADMIN.email, password: nova } })).status, 200);
});

// ─── Registo e escalada de privilégios ─────────────────────────────────────

test('registo cria conta pendente sem acesso a dados', async () => {
  const r = await vol.pedido('/auth/registo', { body: VOL });
  assert.equal(r.status, 201);
  assert.equal(r.data.utilizador.estado, 'pendente');
  assert.equal(r.data.utilizador.papel, 'pendente');
  assert.equal(r.data.utilizador.email, 'vera@teste.local', 'e-mail normalizado');
  ids.vol = r.data.utilizador.uid;
  const lista = await vol.pedido('/registos/campanhas');
  assert.equal(lista.status, 403);
  assert.equal(lista.data.erro, 'conta_nao_aprovada');
});

test('ESCALADA: registo não aceita papel/estado', async () => {
  const r = await new Cliente().pedido('/auth/registo', {
    body: { ...VOL, email: 'hacker@teste.local', papel: 'admin', estado: 'aprovado' },
  });
  assert.equal(r.status, 400);
  assert.equal(r.data.erro, 'dados_invalidos');
});

test('registo com e-mail existente (qualquer capitalização) é recusado', async () => {
  const r = await new Cliente().pedido('/auth/registo', { body: { ...VOL, email: 'VERA@teste.LOCAL' } });
  assert.equal(r.status, 409);
});

test('registo exige consentimento e idade mínima', async () => {
  const r = await new Cliente().pedido('/auth/registo', { body: { ...VOL, email: 'sem-consent@teste.local', aceitaPolitica: false } });
  assert.equal(r.status, 400);
});

test('palavra-passe curta é recusada', async () => {
  const r = await new Cliente().pedido('/auth/registo', { body: { ...VOL, email: 'curta@teste.local', password: 'curta' } });
  assert.equal(r.status, 400);
});

test('login não revela se o e-mail existe', async () => {
  const a = await new Cliente().pedido('/auth/login', { body: { email: 'ninguem@teste.local', password: 'QualquerCoisa#1' } });
  const b = await new Cliente().pedido('/auth/login', { body: { email: VOL.email, password: 'Errada#123456' } });
  assert.equal(a.status, 401);
  assert.equal(b.status, 401);
  assert.equal(a.data.erro, b.data.erro);
});

// ─── Gestão de utilizadores e CSRF ─────────────────────────────────────────

test('CSRF: mutação autenticada por cookie sem Origin é rejeitada', async () => {
  const r = await admin.pedido(`/utilizadores/${ids.vol}`, { method: 'PATCH', body: { papel: 'voluntario', estado: 'aprovado' }, origin: false });
  assert.equal(r.status, 403);
  assert.equal(r.data.erro, 'origem_invalida');
});

test('CSRF: Origin de outro site é rejeitado', async () => {
  const r = await admin.pedido(`/utilizadores/${ids.vol}`, {
    method: 'PATCH',
    body: { estado: 'aprovado' },
    origin: false,
    headers: { origin: 'https://site-malicioso.example' },
  });
  assert.equal(r.status, 403);
});

test('não-admin não gere utilizadores', async () => {
  assert.equal((await vol.pedido('/utilizadores')).status, 403);
  assert.equal((await vol.pedido(`/utilizadores/${ids.vol}`, { method: 'PATCH', body: { estado: 'aprovado' } })).status, 403);
});

test('admin aprova o voluntário (sessões antigas revogadas)', async () => {
  const r = await admin.pedido(`/utilizadores/${ids.vol}`, { method: 'PATCH', body: { papel: 'voluntario', estado: 'aprovado' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.utilizador.estado, 'aprovado');
  assert.equal((await vol.pedido('/auth/sessao')).status, 401);
  assert.equal((await vol.pedido('/auth/login', { body: { email: VOL.email, password: VOL.password } })).status, 200);
});

test('admin não pode alterar a própria conta', async () => {
  const sessao = await admin.pedido('/auth/sessao');
  const r = await admin.pedido(`/utilizadores/${sessao.data.utilizador.uid}`, { method: 'PATCH', body: { estado: 'suspenso' } });
  assert.equal(r.status, 400);
});

// ─── Autorização por papel ─────────────────────────────────────────────────

test('voluntário cria campanha mas não vê dados confidenciais', async () => {
  const campanha = { data: '2026-09-13', nomeDoador: 'D', descricaoBem: 'Arroz', quantidade: '10', recebidoPor: 'Vera' };
  assert.equal((await vol.pedido('/registos/campanhas', { body: campanha })).status, 201);
  const lista = await vol.pedido('/registos/campanhas');
  assert.equal(lista.status, 200);
  assert.equal(lista.data.registos.length, 1);
  assert.equal(typeof lista.data.registos[0].criadoEm, 'string');
  assert.equal((await vol.pedido('/registos/necessidades')).status, 403);
  assert.equal((await vol.pedido('/registos/voluntarios')).status, 403);
  assert.equal((await vol.pedido('/registos/necessidades', { body: { codigoFamilia: 'F1' } })).status, 403);
});

test('registos rejeitam campos fora da ontologia e coleções desconhecidas', async () => {
  assert.equal((await vol.pedido('/registos/campanhas', { body: { descricaoBem: 'x', criadoPor: 'outro' } })).status, 400);
  assert.equal((await vol.pedido('/registos/utilizadores')).status, 404);
  assert.equal((await admin.pedido('/registos/sessoes')).status, 404);
});

test('app Android autentica com Bearer (sem cookie e sem CSRF)', async () => {
  const app = new Cliente();
  const r = await app.pedido('/auth/login', { body: { email: VOL.email, password: VOL.password, cliente: 'app' } });
  assert.equal(r.status, 200);
  assert.ok(r.data.token);
  assert.equal(app.cookie, '', 'a app não recebe cookie');
  app.bearer = r.data.token;
  assert.equal((await app.pedido('/auth/sessao')).data.utilizador.papel, 'voluntario');
  assert.equal((await app.pedido('/registos/stock', { body: { item: 'Feijão' }, origin: false })).status, 201);
  app.bearer = 'token-invalido-com-comprimento-suficiente-000';
  assert.equal((await app.pedido('/auth/sessao')).status, 401);
});

// ─── Formulários públicos ──────────────────────────────────────────────────

test('formulários públicos validam os dados', async () => {
  const anon = new Cliente();
  const voluntario = { name: 'Ana', email: 'ana@exemplo.org', country: 'Portugal', countryCode: 'PT', phone: '+351900', interest: 'Logística', message: 'Olá', consent: true };
  assert.equal((await anon.pedido('/formularios/voluntarios', { body: voluntario })).status, 201);
  assert.equal((await anon.pedido('/formularios/voluntarios', { body: { ...voluntario, email: 'invalido' } })).status, 400);
  assert.equal((await anon.pedido('/formularios/voluntarios', { body: { ...voluntario, papel: 'admin' } })).status, 400);
  const beneficiario = { name: 'Família X', adults: '2', children: '1', supportNeeded: ['alimento'], consent: false, consentSensitive: true };
  assert.equal((await anon.pedido('/formularios/beneficiarios', { body: beneficiario })).status, 400, 'sem consentimento');
  assert.equal((await anon.pedido('/formularios/beneficiarios', { body: { ...beneficiario, consent: true } })).status, 201);
  assert.equal((await anon.pedido('/formularios/inexistente', { body: {} })).status, 404);
  assert.equal(
    (await anon.pedido('/formularios/contactos', { body: 'x'.repeat(70_000) })).status,
    413,
    'corpo demasiado grande'
  );
});

test('formulários exigem consentimento; servidor grava a versão da política', async () => {
  const anon = new Cliente();
  const semConsent = { name: 'Rui', email: 'rui@exemplo.org', message: 'Olá' };
  assert.equal((await anon.pedido('/formularios/contactos', { body: semConsent })).status, 400);
  assert.equal((await anon.pedido('/formularios/contactos', { body: { ...semConsent, consent: true } })).status, 201);
  assert.equal((await anon.pedido('/formularios/contactos', { body: { ...semConsent, consent: true, consentVersion: 'forjada' } })).status, 400);
  const lista = await admin.pedido('/registos/contactos');
  const registo = lista.data.registos.find((r) => r.email === 'rui@exemplo.org');
  assert.match(registo.consentVersion, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(typeof registo.consentAt, 'string');
  assert.equal(registo.consent, undefined);
});

test('beneficiário exige consentimento separado para dados sensíveis', async () => {
  const anon = new Cliente();
  const base = { name: 'Família Z', consent: true };
  assert.equal((await anon.pedido('/formularios/beneficiarios', { body: base })).status, 400);
  assert.equal((await anon.pedido('/formularios/beneficiarios', { body: { ...base, consentSensitive: true } })).status, 201);
});

test('formulários públicos têm limite de pedidos', async () => {
  const anon = new Cliente();
  const estados = [];
  for (let i = 0; i < 11; i++) {
    estados.push((await anon.pedido('/formularios/newsletter', { body: { email: `n${i}@exemplo.org`, consent: true } })).status);
  }
  assert.deepEqual(estados.slice(0, 10), Array(10).fill(201));
  assert.equal(estados[10], 429);
});

// ─── Códigos de acesso ─────────────────────────────────────────────────────

test('código de acesso: emitido pelo admin, de uso único, repõe a palavra-passe', async () => {
  const emit = await admin.pedido(`/utilizadores/${ids.vol}/codigo-acesso`, { body: {} });
  assert.equal(emit.status, 201);
  assert.match(emit.data.codigo, /^[0-9A-Z]{5}-[0-9A-Z]{5}$/);
  assert.equal((await vol.pedido('/auth/sessao')).status, 401, 'sessões revogadas ao emitir código');

  const anon = new Cliente();
  const errado = await anon.pedido('/auth/definir-password', { body: { email: VOL.email, codigo: 'AAAAA-AAAAA', novaPassword: 'Nova#Vera#12345' } });
  assert.equal(errado.status, 400);

  const certo = await vol.pedido('/auth/definir-password', {
    body: { email: VOL.email, codigo: emit.data.codigo.toLowerCase(), novaPassword: 'Nova#Vera#12345' },
  });
  assert.equal(certo.status, 200);
  assert.equal((await vol.pedido('/auth/sessao')).status, 200);

  const reutilizado = await anon.pedido('/auth/definir-password', { body: { email: VOL.email, codigo: emit.data.codigo, novaPassword: 'Outra#Vera#12345' } });
  assert.equal(reutilizado.status, 400, 'código é de uso único');
  assert.equal((await anon.pedido('/auth/login', { body: { email: VOL.email, password: VOL.password } })).status, 401);
  VOL.password = 'Nova#Vera#12345';
  assert.equal((await anon.pedido('/auth/login', { body: { email: VOL.email, password: VOL.password } })).status, 200);
});

test('alterar palavra-passe exige a actual', async () => {
  assert.equal((await vol.pedido('/auth/alterar-password', { body: { actual: 'errada', nova: 'Mais#Uma#Vera#1' } })).status, 401);
  const r = await vol.pedido('/auth/alterar-password', { body: { actual: VOL.password, nova: 'Mais#Uma#Vera#1' } });
  assert.equal(r.status, 200);
  VOL.password = 'Mais#Uma#Vera#1';
});

// ─── Pedidos de apoio ──────────────────────────────────────────────────────

test('beneficiário aprovado cria e vê só os seus pedidos; gestão muda o estado', async () => {
  const reg = await ben.pedido('/auth/registo', { body: BEN });
  assert.equal(reg.status, 201);
  ids.ben = reg.data.utilizador.uid;
  assert.equal((await ben.pedido('/pedidos', { body: { titulo: 'Ajuda' } })).status, 403, 'pendente');

  assert.equal((await admin.pedido(`/utilizadores/${ids.ben}`, { method: 'PATCH', body: { papel: 'beneficiario', estado: 'aprovado' } })).status, 200);
  assert.equal((await ben.pedido('/auth/login', { body: { email: BEN.email, password: BEN.password } })).status, 200);

  const criado = await ben.pedido('/pedidos', { body: { titulo: 'Cesta básica', descricao: 'Família de 4' } });
  assert.equal(criado.status, 201);
  assert.equal((await ben.pedido('/pedidos', { body: { titulo: 'x', estado: 'resolvido' } })).status, 400);

  const meus = await ben.pedido('/pedidos');
  assert.equal(meus.data.pedidos.length, 1);
  assert.equal(meus.data.pedidos[0].estado, 'novo');
  assert.equal(meus.data.pedidos[0].uid, ids.ben);

  assert.equal((await vol.pedido('/pedidos', { body: { titulo: 'Não sou beneficiária' } })).status, 403);
  assert.equal((await ben.pedido(`/pedidos/${criado.data.id}`, { method: 'PATCH', body: { estado: 'resolvido' } })).status, 403);
  assert.equal((await admin.pedido(`/pedidos/${criado.data.id}`, { method: 'PATCH', body: { estado: 'em_analise' } })).status, 200);
  assert.equal((await admin.pedido('/pedidos')).data.pedidos[0].estado, 'em_analise');
  assert.equal((await ben.pedido('/registos/campanhas')).status, 403);
});

// ─── Direitos dos titulares ────────────────────────────────────────────────

test('pedido de direitos: público, visível e gerível só por admin', async () => {
  const anon = new Cliente();
  const r = await anon.pedido('/formularios/direitos', { body: { name: 'Titular', email: 'titular@exemplo.org', tipo: 'eliminacao' } });
  assert.equal(r.status, 201);
  assert.equal((await anon.pedido('/formularios/direitos', { body: { name: 'X', email: 'x@exemplo.org', tipo: 'inventado' } })).status, 400);
  const lista = await admin.pedido('/registos/pedidosTitulares');
  assert.equal(lista.status, 200);
  const pedido = lista.data.registos.find((p) => p.id === r.data.id);
  assert.equal(pedido.estado, 'novo');
  assert.ok(Date.parse(pedido.prazoResposta) > Date.now() + 29 * 24 * 3600 * 1000);
  assert.equal((await vol.pedido('/registos/pedidosTitulares')).status, 403);
  assert.equal((await admin.pedido(`/registos/pedidosTitulares/${r.data.id}`, { method: 'PATCH', body: { estado: 'em_curso' } })).status, 200);
  assert.equal((await admin.pedido(`/registos/pedidosTitulares/${r.data.id}`, { method: 'PATCH', body: { estado: 'apagado' } })).status, 400);
  assert.equal((await ben.pedido(`/registos/pedidosTitulares/${r.data.id}`, { method: 'PATCH', body: { estado: 'concluido' } })).status, 403);
});

test('titular exporta os seus dados', async () => {
  const r = await ben.pedido('/conta/dados');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-disposition'), /attachment/);
  assert.equal(r.data.conta.email, BEN.email);
  assert.equal(r.data.pedidosApoio.length, 1);
  assert.equal(r.data.conta.passwordHash, undefined);
});

test('titular elimina a própria conta (admin não pode)', async () => {
  assert.equal((await admin.pedido('/conta', { method: 'DELETE', body: { password: ADMIN.password } })).status, 400);
  assert.equal((await ben.pedido('/conta', { method: 'DELETE', body: { password: 'errada' } })).status, 401);
  const app = new Cliente();
  app.bearer = (await app.pedido('/auth/login', { body: { email: BEN.email, password: BEN.password, cliente: 'app' } })).data.token;
  const r = await app.pedido('/conta/eliminar', { body: { password: BEN.password }, origin: false });
  assert.equal(r.status, 200);
  assert.equal((await ben.pedido('/auth/sessao')).status, 401, 'sessões revogadas');
  assert.equal((await new Cliente().pedido('/auth/login', { body: { email: BEN.email, password: BEN.password } })).status, 401);
  const pedidos = await admin.pedido('/pedidos');
  assert.ok(pedidos.data.pedidos.every((p) => p.uid !== ids.ben), 'pedidos anonimizados');
});

test('401 inclui WWW-Authenticate (compatibilidade com clientes Android)', async () => {
  const r = await new Cliente().pedido('/auth/sessao');
  assert.match(r.headers.get('www-authenticate') ?? '', /Bearer/);
});

// ─── Suspensão e logout ────────────────────────────────────────────────────

test('suspensão revoga sessões e bloqueia o login', async () => {
  assert.equal((await admin.pedido(`/utilizadores/${ids.vol}`, { method: 'PATCH', body: { estado: 'suspenso' } })).status, 200);
  assert.equal((await vol.pedido('/auth/sessao')).status, 401);
  const r = await vol.pedido('/auth/login', { body: { email: VOL.email, password: VOL.password } });
  assert.equal(r.status, 403);
  assert.equal(r.data.erro, 'conta_suspensa');
});

test('logout invalida a sessão no servidor', async () => {
  const cookieAntigo = admin.cookie;
  assert.equal((await admin.pedido('/auth/logout', { body: {} })).status, 200);
  const reuso = new Cliente();
  reuso.cookie = cookieAntigo;
  assert.equal((await reuso.pedido('/auth/sessao')).status, 401, 'o cookie roubado deixa de valer');
});

test('respostas da API não são guardadas em cache', async () => {
  const r = await new Cliente().pedido('/auth/sessao');
  assert.equal(r.headers.get('cache-control'), 'no-store');
});
