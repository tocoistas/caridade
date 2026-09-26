'use client';

import { classesEstado, etiquetaEstado } from '@/lib/adminEstados';

/** Etiqueta colorida de estado (novo, em análise, concluído…). */
export default function Distintivo({ estado, className = '' }: { estado: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-montserrat font-medium ring-1 ring-inset ${classesEstado(
        estado
      )} ${className}`}
    >
      {etiquetaEstado(estado)}
    </span>
  );
}
