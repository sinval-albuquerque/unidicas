import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { MateriaCard } from "@/components/MateriaCard";
import { obterTodasMaterias } from "@/lib/materias";

export const metadata = {
  title: "Matérias",
  description:
    "Comparativos, guias e análises para você escolher o melhor produto.",
};

/** Arquivo de todas as matérias com sidebar. */
export default function MateriasPage() {
  const materias = obterTodasMaterias();
  const destaque = materias[0];
  const demais = materias.slice(1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Conteúdo editorial
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Matérias
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          Comparativos, guias de compra e análises com produtos linkados
          direto no meio do texto. Sem enrolação, só o que ajuda você a
          decidir.
        </p>
      </header>

      {materias.length === 0 ? (
        <p className="text-text-muted">Nenhuma matéria publicada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {destaque && <MateriaCard materia={destaque} variant="featured" />}

            {demais.length > 0 && (
              <section>
                {destaque && (
                  <h2 className="text-xl font-extrabold tracking-tight mb-5 pb-2 border-b-2 border-border">
                    Mais matérias
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {demais.map((m) => (
                    <MateriaCard key={m.slug} materia={m} />
                  ))}
                </div>
              </section>
            )}
          </div>

          <Sidebar />
        </div>
      )}

      <div className="mt-12 text-sm">
        <Link href="/" className="text-primary font-semibold no-underline hover:underline">
          ← Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
