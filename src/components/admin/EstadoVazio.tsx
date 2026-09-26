'use client';

import Image from 'next/image';
import vazio from '@/assets/ilustracoes/vazio.svg';

/** Estado vazio ilustrado — usado quando não há registos ou a pesquisa não devolve nada. */
export default function EstadoVazio({
  titulo,
  descricao,
  accao,
}: {
  titulo: string;
  descricao?: string;
  accao?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-creme-escuro bg-white px-6 py-12 text-center">
      <Image src={vazio} alt="" className="mx-auto mb-4 h-32 w-auto" />
      <p className="font-montserrat font-semibold text-petroleo">{titulo}</p>
      {descricao && <p className="mt-1 text-sm text-petroleo/60">{descricao}</p>}
      {accao && <div className="mt-5">{accao}</div>}
    </div>
  );
}
