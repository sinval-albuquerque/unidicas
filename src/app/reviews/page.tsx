import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { ReviewList } from "@/components/ReviewList";
import { obterTodasReviews, obterReviewsEmDestaque } from "@/lib/reviews";
import { CATEGORIAS } from "@/lib/categorias";
import { obterReviewsPorCategoria } from "@/lib/reviews";

export const metadata = {
  title: "Todas as Reviews",
  description: "Catálogo completo de reviews e análises de produtos.",
};

/** Arquivo de todas as reviews: lista com sidebar e filtro por categoria. */
export default function ReviewsPage() {
  const todas = obterTodasReviews();
  const destaques = obterReviewsEmDestaque();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Cabeçalho */}
      <header className="mb-10 pb-6 border-b border-border">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold mb-2">
          Catálogo
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Todas as Reviews
        </h1>
        <p className="text-base text-text-soft max-w-2xl">
          {todas.length} produtos analisados de forma independente. Use a busca
          para encontrar o que precisa.
        </p>
      </header>

      {/* Filtro rápido por categoria */}
      <nav className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/reviews"
          className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-primary text-white no-underline"
        >
          Todas ({todas.length})
        </Link>
        {CATEGORIAS.map((c) => {
          const count = obterReviewsPorCategoria(c.slug).length;
          if (count === 0) return null;
          return (
            <Link
              key={c.slug}
              href={`/categorias/${c.slug}`}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-full bg-bg-alt border border-border text-text-soft hover:border-primary hover:text-primary no-underline transition"
            >
              {c.nome} ({count})
            </Link>
          );
        })}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {destaques.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
                ⭐ Em destaque
              </h2>
              <ReviewList reviews={destaques} />
            </section>
          )}

          <section>
            <h2 className="text-xl font-extrabold tracking-tight mb-4 pb-2 border-b-2 border-border">
              Catálogo completo
            </h2>
            <ReviewList reviews={todas} />
          </section>
        </div>

        <Sidebar />
      </div>
    </div>
  );
}
