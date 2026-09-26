// Áreas do painel de administração: agrupam as coleções na navegação lateral.
//
// Vive num ficheiro próprio (e não em `adminCollections.ts`) para que a
// verificação da ontologia — que lê os blocos `{ id: '…' }` desse ficheiro como
// coleções — não confunda uma área com uma coleção.
import type { NomeIcone } from '@/components/Icone';

export const GRUPOS_ADMIN = [
  {
    id: 'pessoas',
    label: 'Pessoas',
    descricao: 'Quem se inscreveu, quem pede apoio e quem colabora.',
    icone: 'pessoas',
  },
  {
    id: 'eixo1',
    label: 'Eixo 1 · Mão que Ampara',
    descricao: 'Recolha, armazenamento e entrega de bens essenciais.',
    icone: 'mao',
  },
  {
    id: 'eixo2',
    label: 'Eixo 2 · Coração que Cuida',
    descricao: 'Encaminhamento clínico e acções de prevenção.',
    icone: 'coracaoCuidado',
  },
  {
    id: 'eixo3',
    label: 'Eixo 3 · Ponte de Esperança',
    descricao: 'Ligação entre necessidades concretas e quem as pode resolver.',
    icone: 'ponte',
  },
  {
    id: 'atendimento',
    label: 'Atendimento',
    descricao: 'Mensagens recebidas e pedidos submetidos no portal.',
    icone: 'pedido',
  },
  {
    id: 'privacidade',
    label: 'Privacidade',
    descricao: 'Exercício de direitos dos titulares dos dados.',
    icone: 'escudo',
  },
] as const satisfies readonly { id: string; label: string; descricao: string; icone: NomeIcone }[];

export type GrupoId = (typeof GRUPOS_ADMIN)[number]['id'];

