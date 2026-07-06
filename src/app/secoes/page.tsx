import Link from "next/link";
import type { Metadata } from "next";
import { SECOES } from "@/lib/secoes";
import { obterCategoriasPorSecao } from "@/lib/secoes";
import { obterTodasReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Seções",
  description: "Navegue o Unidicas por seção: Tecnologia, Ferramentas, Esportes e Kits.",
};

/** Página-índice de todas as seções. Cada seção tem sua própria cor. */
export default function SecoesIndexPage() {
  const reviews = obterTodasReviews();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Seções
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Todas as Seções
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          O Unidicas está organizado em quatro grandes seções, cada uma com sua
          identidade visual. Escolha uma para explorar as categorias dentro dela.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {SECOES.map((s) => {
          const categorias = obterCategoriasPorSecao(s.slug);
          const totalReviews = reviews.filter((r) =>
            categorias.some((c) => c.slug === r.categoria),
          ).length;

          return (
            <Link
              key={s.slug}
              href={`/secoes/${s.slug}`}
              className="group block bg-bg rounded-xl p-6 transition hover:shadow-md no-underline"
              style={{ border: `1px solid var(--color-border)`, borderLeft: `4px solid ${s.cor}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: s.corLight }}
                  aria-hidden
                >
                  {s.icone}
                </span>
                <h2
                  className="text-xl font-extrabold tracking-tight"
                  style={{ color: s.cor }}
                >
                  {s.nome}
                </h2>
              </div>

              <p className="text-sm text-text-soft mb-4 leading-relaxed">
                {s.descricao}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="text-xs text-text-muted">
                  {categorias.length}{" "}
                  {categorias.length === 1 ? "categoria" : "categorias"} ·{" "}
                  {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </span>
                <span
                  className="text-sm font-semibold group-hover:underline"
                  style={{ color: s.cor }}
                >
                  Ver seção →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}