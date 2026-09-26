/**
 * Dados de contacto público e redes sociais do projecto.
 *
 * Fonte única: o rodapé e a página de contacto lêem daqui, para não divergirem.
 * Só constam redes com endereço real — uma ligação para `#` é uma ligação morta.
 */
import type { NomeIcone } from '@/components/Icone';

export const CONTACTO = {
  moradaLinhas: ['Estrada da Pedreira, S/N', 'Bairro 17 de Setembro', 'Icolo e Bengo, Angola'],
  telefone: '+244 923 456 789',
  /** Formato E.164, para os esquemas `tel:` e `https://wa.me/`. */
  telefoneE164: '+244923456789',
  email: 'info@caridade.ao',
} as const;

export interface RedeSocial {
  nome: string;
  icone: NomeIcone;
  url: string;
}

export const REDES_SOCIAIS: RedeSocial[] = [
  { nome: 'WhatsApp', icone: 'whatsapp', url: `https://wa.me/${CONTACTO.telefoneE164.replace('+', '')}` },
  { nome: 'Facebook', icone: 'facebook', url: 'https://www.facebook.com/caridade.ao' },
];
