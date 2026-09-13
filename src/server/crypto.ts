import 'server-only';
import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

// scrypt (RFC 7914) — memória = 128·N·r ≈ 32 MiB por hash; resistente a GPU/ASIC.
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, keylen: number, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize('NFKC'), salt, keylen, { N: n, r, p, maxmem: 256 * n * r }, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
}

/** Devolve `scrypt$N$r$p$salt$hash` (base64url). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN, N, R, P);
  return ['scrypt', N, R, P, salt.toString('base64url'), hash.toString('base64url')].join('$');
}

/** Hash fictício para igualar o tempo de resposta quando o utilizador não existe. */
let dummyHash: Promise<string> | undefined;

/** Verifica a palavra-passe em tempo constante. Nunca lança por hash malformado. */
export async function verificarPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  const alvo = stored ?? (await (dummyHash ??= hashPassword('palavra-passe-ficticia')));
  const [alg, n, r, p, salt, hash] = alvo.split('$');
  if (alg !== 'scrypt' || !salt || !hash) return false;
  try {
    const esperado = Buffer.from(hash, 'base64url');
    const obtido = await scrypt(password, Buffer.from(salt, 'base64url'), esperado.length, Number(n), Number(r), Number(p));
    return Boolean(stored) && obtido.length === esperado.length && timingSafeEqual(obtido, esperado);
  } catch {
    return false;
  }
}

export function sha256(valor: string): string {
  return createHash('sha256').update(valor).digest('hex');
}

/** Token de sessão opaco (256 bits). Só o sha256 é guardado na base de dados. */
export function gerarToken(): string {
  return randomBytes(32).toString('base64url');
}

// Crockford base32 sem caracteres ambíguos (I, L, O, U).
const ALFABETO = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Código de acesso de uso único (50 bits), formato `XXXXX-XXXXX`. */
export function gerarCodigoAcesso(): string {
  const chars = Array.from({ length: 10 }, () => ALFABETO[randomInt(ALFABETO.length)]);
  return `${chars.slice(0, 5).join('')}-${chars.slice(5).join('')}`;
}

/** Normaliza um código introduzido pelo utilizador (maiúsculas, sem hífens/espaços, O→0, I/L→1). */
export function normalizarCodigo(codigo: string): string {
  return codigo.toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
}
