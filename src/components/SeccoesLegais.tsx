import { Link } from '@/i18n/navigation';

export interface SeccaoLegal {
  titulo: string;
  paragrafos?: string[];
  itens?: string[];
}

const LIGACOES: Record<string, string> = {
  '/direitos-dados': '/direitos-dados',
  '/politica-cookies': '/politica-cookies',
  '/politica-privacidade': '/politica-privacidade',
};

/** Converte "[texto](/rota)" em ligações internas localizadas; o resto é texto simples. */
function comLigacoes(texto: string) {
  const partes = texto.split(/(\[[^\]]+\]\(\/[a-z-]+\))/g);
  return partes.map((parte, i) => {
    const m = parte.match(/^\[([^\]]+)\]\((\/[a-z-]+)\)$/);
    if (m && LIGACOES[m[2]]) {
      return (
        <Link key={i} href={LIGACOES[m[2]]} className="text-terracotta underline">
          {m[1]}
        </Link>
      );
    }
    return <span key={i}>{parte}</span>;
  });
}

/** Texto legal estruturado em secções (título, parágrafos, listas), vindo das mensagens i18n. */
export default function SeccoesLegais({ seccoes }: { seccoes: SeccaoLegal[] }) {
  return (
    <>
      {seccoes.map((s) => (
        <section key={s.titulo}>
          <h2 className="text-2xl font-bold text-petroleo mt-8 mb-4">{s.titulo}</h2>
          {s.paragrafos?.map((p, i) => (
            <p key={i} className="mb-4">
              {comLigacoes(p)}
            </p>
          ))}
          {s.itens && (
            <ul className="list-disc pl-6 mb-4 space-y-2">
              {s.itens.map((item, i) => (
                <li key={i}>{comLigacoes(item)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
