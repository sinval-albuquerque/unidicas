import Link from "next/link";
import { CATEGORIAS } from "@/lib/categorias";
import { obterReviewsPorCategoria } from "@/lib/reviews";

export const metadata = {
  title: "Categorias",
  description: "Veja todas as categorias de produtos analisados.",
};

/** Página-índice de todas as categorias. */
export default function CategoriasIndexPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Categorias
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Todas as Categorias
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          Navegue por categoria para ver reviews, comparativos e o melhor
          produto em cada atributo.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIAS.map((c) => {
          const reviews = obterReviewsPorCategoria(c.slug);
          return (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="group block bg-bg border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition no-underline"
            >
              <h2 className="text-xl font-extrabold text-text group-hover:text-primary mb-2">
                {c.nome}
              </h2>
              <p className="text-sm text-text-soft mb-4 leading-relaxed">
                {c.descricao}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-text-muted">
                  {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </span>
                <span className="text-sm font-semibold text-primary group-hover:underline">
                  Ver tudo →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
