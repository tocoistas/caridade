#!/usr/bin/env node
/**
 * Guarda de privacidade dos relatórios.
 *
 * Os relatórios saem da organização — para voluntários, doadores, empresas, o
 * site. Nenhum deles pode ler um campo com o nome, o contacto, a morada ou a
 * situação social/clínica de uma pessoa apoiada: identificam-se **sempre e só**
 * pelo código de cadastro, e mesmo esse só nos relatórios internos.
 *
 * Esta verificação falha se o gerador passar a ler um desses campos. É
 * deliberadamente grosseira (procura o nome do campo entre aspas): é preferível
 * um falso positivo — que se resolve pensando duas vezes — a um nome de uma
 * família numa publicação de redes sociais.
 *
 * Uso: npm run check:relatorios
 */
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FICHEIRO = 'src/lib/relatorios/gerar.ts';

/** Campos que identificam alguém ou revelam a sua situação. */
const PROIBIDOS = [
  // Identificação directa de quem é apoiado
  'nomeBeneficiario',
  'beneficiarioNome',
  'codigoFamilia',
  'id_number',
  'birthdate',
  'address',
  // Contactos
  'phone',
  'email',
  'telefone',
  'contacto',
  'contactoAgendamento',
  'contactabilidade',
  'pessoaContacto',
  // Situação social e saúde
  'situacao',
  'motivo',
  'necessidadeEspecifica',
  'necessidadeMaterial',
  'agregadoFamiliar',
  'observacoes',
  'supportNeeded',
  // Identificação de doadores particulares
  'identidadeDoador',
];

const fonte = await readFile(join(ROOT, FICHEIRO), 'utf8');
const encontrados = PROIBIDOS.filter((campo) => fonte.includes(`'${campo}'`));

if (encontrados.length) {
  console.error(`❌ ${FICHEIRO} lê campos que não podem sair num relatório:`);
  for (const campo of encontrados) console.error(`   • ${campo}`);
  console.error(
    '\nOs relatórios identificam pessoas apoiadas apenas pelo código de cadastro.' +
      '\nSe o campo for mesmo necessário, reveja a regra em src/lib/relatorios/tipos.ts' +
      '\ne actualize esta lista com a justificação.'
  );
  process.exit(1);
}

console.log(`✅ Relatórios sem dados pessoais: ${PROIBIDOS.length} campos verificados em ${FICHEIRO}.`);
